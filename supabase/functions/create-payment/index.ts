import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://esm.sh/zod@3.23.8";

const ALLOWED_ORIGINS = [
  'https://datasteel.lovable.app',
  'https://datasteel.com.br',
  'https://www.datasteel.com.br',
  'https://id-preview--2cc2d68c-89d0-4f2f-9b12-db6b1a173e7f.lovable.app',
  'http://localhost:5173',
  'http://localhost:8080',
];

function buildCorsHeaders(origin: string | null) {
  const allowed = origin && (ALLOWED_ORIGINS.includes(origin) || /\.lovable\.app$/.test(new URL(origin).hostname))
    ? origin
    : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
    'Vary': 'Origin',
  };
}

const PACKAGES: Record<string, { credits: number; price: number; title: string }> = {
  '10': { credits: 10, price: 9.90, title: '10 Créditos DataSteel' },
  '50': { credits: 50, price: 39.90, title: '50 Créditos DataSteel' },
  '100': { credits: 100, price: 69.90, title: '100 Créditos DataSteel' },
};

const InputSchema = z.object({
  packageId: z.enum(['10', '50', '100']),
});

serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req.headers.get('origin'));

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const mpToken = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN");

    if (!mpToken) throw new Error("MERCADO_PAGO_ACCESS_TOKEN not configured");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autenticado" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Não autenticado" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let payload: unknown;
    try {
      payload = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Requisição inválida" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const parsed = InputSchema.safeParse(payload);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "Pacote inválido" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const pkg = PACKAGES[parsed.data.packageId];

    const mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${mpToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: [{
          title: pkg.title,
          quantity: 1,
          unit_price: pkg.price,
          currency_id: "BRL",
        }],
        payment_methods: { excluded_payment_types: [], installments: 1 },
        back_urls: {
          success: "https://datasteel.lovable.app/dashboard?payment=success",
          failure: "https://datasteel.lovable.app/dashboard?payment=failure",
          pending: "https://datasteel.lovable.app/dashboard?payment=pending",
        },
        auto_return: "approved",
        notification_url: `${supabaseUrl}/functions/v1/mp-webhook`,
        external_reference: `${user.id}:${pkg.credits}`,
      }),
    });

    if (!mpResponse.ok) {
      console.error("Mercado Pago error:", mpResponse.status);
      return new Response(JSON.stringify({ error: "Erro ao criar pagamento" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const mpData = await mpResponse.json();

    return new Response(JSON.stringify({
      init_point: mpData.init_point,
      sandbox_init_point: mpData.sandbox_init_point,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Create payment error:", error);
    return new Response(JSON.stringify({ error: "Erro ao processar a requisição" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
