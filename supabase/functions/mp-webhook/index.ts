import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://esm.sh/zod@3.23.8";

// Webhook is called server-to-server by Mercado Pago — no CORS needed
const baseHeaders = { "Content-Type": "application/json" };

const WebhookSchema = z.object({
  type: z.string().optional(),
  action: z.string().optional(),
  data: z.object({
    id: z.union([z.string(), z.number()]).transform(String),
  }).optional(),
});

async function verifyMpSignature(req: Request, dataId: string): Promise<boolean> {
  const secret = Deno.env.get("MERCADO_PAGO_WEBHOOK_SECRET");
  // If the secret isn't configured, skip verification (legacy behavior).
  if (!secret) return true;

  const xSignature = req.headers.get("x-signature");
  const xRequestId = req.headers.get("x-request-id");
  if (!xSignature || !xRequestId) return false;

  // Parse "ts=...,v1=..."
  const parts = Object.fromEntries(
    xSignature.split(",").map((p) => p.trim().split("=").map((s) => s.trim())),
  );
  const ts = parts["ts"];
  const v1 = parts["v1"];
  if (!ts || !v1) return false;

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sigBuf = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(manifest));
  const computed = Array.from(new Uint8Array(sigBuf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return computed === v1;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 405 });
  }

  try {
    const mpToken = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!mpToken) throw new Error("MERCADO_PAGO_ACCESS_TOKEN not configured");

    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid body" }), { status: 400, headers: baseHeaders });
    }

    const parsed = WebhookSchema.safeParse(rawBody);
    if (!parsed.success) {
      return new Response(JSON.stringify({ ok: true }), { headers: baseHeaders });
    }
    const body = parsed.data;

    if (body.type !== "payment" && body.action !== "payment.created" && body.action !== "payment.updated") {
      return new Response(JSON.stringify({ ok: true }), { headers: baseHeaders });
    }

    const paymentId = body.data?.id;
    if (!paymentId || !/^\d+$/.test(paymentId)) {
      return new Response(JSON.stringify({ ok: true }), { headers: baseHeaders });
    }

    // Verify Mercado Pago signature when secret is configured
    const sigOk = await verifyMpSignature(req, paymentId);
    if (!sigOk) {
      console.warn("Invalid MP webhook signature");
      return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 401, headers: baseHeaders });
    }

    const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${mpToken}` },
    });

    if (!paymentResponse.ok) {
      console.error("MP payment fetch error:", paymentResponse.status);
      return new Response(JSON.stringify({ error: "Failed to fetch payment" }), { status: 500, headers: baseHeaders });
    }

    const payment = await paymentResponse.json();

    if (payment.status !== "approved") {
      return new Response(JSON.stringify({ ok: true, status: payment.status }), { headers: baseHeaders });
    }

    const [userId, creditsStr] = (payment.external_reference || "").split(":");
    const credits = parseInt(creditsStr, 10);

    if (!userId || !/^[0-9a-f-]{36}$/i.test(userId) || isNaN(credits) || credits <= 0) {
      console.error("Invalid external_reference");
      return new Response(JSON.stringify({ error: "Invalid reference" }), { status: 400, headers: baseHeaders });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data, error } = await supabase.rpc("credit_user", {
      p_user_id: userId,
      p_amount: credits,
      p_mp_payment_id: String(paymentId),
    });

    if (error) {
      console.error("Credit user error:", error);
      return new Response(JSON.stringify({ error: "Failed to credit user" }), { status: 500, headers: baseHeaders });
    }

    return new Response(JSON.stringify({ ok: true, new_balance: data }), { headers: baseHeaders });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: "Internal error" }), { status: 500, headers: baseHeaders });
  }
});
