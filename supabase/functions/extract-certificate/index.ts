import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Authenticate user and check credits
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;

    if (authHeader) {
      const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user } } = await supabaseAuth.auth.getUser();
      userId = user?.id ?? null;
    }

    if (!userId) {
      return new Response(JSON.stringify({ error: "Não autenticado. Faça login para continuar." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check and debit credit using service role
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    const { data: debitResult, error: debitError } = await supabaseAdmin.rpc("debit_credit", {
      p_user_id: userId,
    });

    if (debitError || debitResult === -1) {
      return new Response(JSON.stringify({ error: "Créditos insuficientes. Adquira mais créditos para continuar." }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { base64Image, mimeType } = await req.json();
    if (!base64Image) {
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extract raw base64 data (remove data URL prefix if present)
    const imageData = base64Image.includes(",") ? base64Image.split(",")[1] : base64Image;
    
    // Detect mime type from data URL or use provided mimeType
    let detectedMime = mimeType || "image/jpeg";
    if (!mimeType && base64Image.includes(",")) {
      const match = base64Image.match(/^data:([^;]+);/);
      if (match) detectedMime = match[1];
    }

    const prompt = `Analise este certificado de aço e realize uma varredura cíclica para identificar todas as corridas (Heats) presentes.
              
Para CADA corrida encontrada (identificada por termos como "Corrida", "Heat" ou "Heat No"), extraia:
1. O número da corrida.
2. A composição química (C, Si, Mn, P, S, Cr, Mo, Ni, Cu, V). Se um elemento não estiver presente, retorne null.
3. Dureza Brinell (HB): Procure o valor de HB nas seguintes fontes, em ordem de prioridade:
   a) Campo, coluna ou seção dedicada a "Dureza", "Hardness", "HB" ou "Brinell" (ex: "Dureza: 280 HB", coluna "HB" com valor 400).
   b) Valor HB embutido no nome/grau do material (Qualidade/Steel Grade). Exemplo: "NRU-CG-QC-HB-320" contém HB 320. Se o grau contém "HB" seguido de um número (ex: HB-320, HB320, HB 400), extraia esse número como hbValue.
   c) Tabela de ensaios mecânicos com coluna específica de dureza.
   REGRAS:
   - NÃO confunda LE/YS, LR/TS, Alongamento ou outros ensaios com dureza HB.
   - Se encontrar, informe em hbSource a localização exata (ex: "Grau do material 'NRU-CG-QC-HB-320'" ou "Coluna 'Dureza Brinell'").
   - Se NÃO encontrar em nenhuma das fontes acima, retorne hbValue e hbSource como null.
   - NA DÚVIDA, retorne null.
4. Dimensões e o grau do material vinculados àquela corrida.
5. Um parecer técnico (aiInsights) em português. Siga estas regras na ordem:

   REGRA 1 - Se hbValue for detectado:
   PRIORIZE o fato de ser um aço tratado termicamente.
   Explique que a alta dureza (HB) altera completamente as propriedades mecânicas,
   tornando o material impróprio para dobra e usinagem convencional,
   independentemente da composição química aparentemente favorável.
   Indique as aplicações corretas (desgaste, mineração, revestimentos).
   NÃO mencione recomendações de dobra, solda ou usinagem convencional.

   REGRA 2 - Se hbValue for null:
   Avalie a composição química de forma qualitativa.
   NÃO calcule nem mencione Carbono Equivalente, CE ou qualquer índice numérico.
   O CE já é calculado e exibido separadamente pela interface.

   Defina o tom do parecer com base na composição:
   a) Se C <= 0,22 e Mn <= 1,00 e sem elementos de liga significativos:
      Enfatize que o material possui ótimas características para dobra, usinagem e solda.
      Destaque a facilidade de processamento e as aplicações práticas.

   b) Se C entre 0,22 e 0,25 ou Mn entre 1,00 e 1,40:
      Alerte que o material pode requerer alguns cuidados nos processos
      de dobra, usinagem e soldagem.

   c) Se C > 0,25 ou Mn > 1,40 ou presença significativa de Cr/Mo:
      Enfatize que processos especiais serão necessários
      (pré-aquecimento na soldagem, ferramentas específicas, dobra a quente).

   Em todos os casos:
   - Foque na composição química e seus efeitos práticos
   - Breve explicação do papel dos elementos que se destacam
   - NÃO mencione tratamento térmico, têmpera ou ausência de HB
   - NÃO repita valores numéricos, percentuais ou status já visíveis nos outros campos
   - NÃO calcule nem mencione CE, Carbono Equivalente ou qualquer índice
   - Seja conciso (3-4 frases) e focado em informações úteis para tomada de decisão

REGRAS IMPORTANTES:
- Fidelidade aos Dados: Se um elemento químico ou o valor de HB não estiver presente, retorne null. Não especule valores.
- Isolamento: A composição química e a dureza (HB) devem estar estritamente vinculadas ao seu respectivo número de corrida.

Retorne os dados usando a função extract_heats.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: `data:${detectedMime};base64,${imageData}` },
              },
              { type: "text", text: prompt },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_heats",
              description: "Extract heat/corrida data from steel certificate",
              parameters: {
                type: "object",
                properties: {
                  heats: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        heatNumber: { type: "string" },
                        elements: {
                          type: "object",
                          properties: {
                            C: { type: "number", nullable: true },
                            Si: { type: "number", nullable: true },
                            Mn: { type: "number", nullable: true },
                            P: { type: "number", nullable: true },
                            S: { type: "number", nullable: true },
                            Cr: { type: "number", nullable: true },
                            Mo: { type: "number", nullable: true },
                            Ni: { type: "number", nullable: true },
                            Cu: { type: "number", nullable: true },
                            V: { type: "number", nullable: true },
                          },
                          required: ["C", "Si", "Mn", "P", "S", "Cr", "Mo", "Ni", "Cu", "V"],
                        },
                        hbValue: { type: "number", nullable: true },
                        hbSource: { type: "string", nullable: true },
                        dimensions: { type: "string" },
                        materialGrade: { type: "string" },
                        aiInsights: { type: "string" },
                      },
                      required: ["heatNumber", "elements", "hbValue", "hbSource", "dimensions", "materialGrade", "aiInsights"],
                    },
                  },
                },
                required: ["heats"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "extract_heats" } },
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Tente novamente em alguns instantes." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes. Adicione créditos ao workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Erro ao processar arquivo" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      console.error("No tool call in response:", JSON.stringify(data));
      return new Response(JSON.stringify({ error: "Não foi possível extrair dados do certificado" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const extracted = JSON.parse(toolCall.function.arguments);

    // Deterministic post-processing: remove any CE/Carbon Equivalent mentions
    extracted.heats.forEach((h: { aiInsights?: string; hbValue?: number | null; materialGrade?: string }) => {
      if (h.aiInsights) {
        h.aiInsights = h.aiInsights
          .replace(/[^.]*(?:Carbono Equivalente|CE\s*(?:de|=|:|\()\s*\d)[^.]*\.\s*/gi, '')
          .replace(/\s{2,}/g, ' ')
          .trim();
      }
      // Fallback: extract HB from materialGrade if AI missed it
      if ((h.hbValue === null || h.hbValue === undefined) && h.materialGrade) {
        const hbMatch = h.materialGrade.match(/HB[- ]?(\d{2,3})/i);
        if (hbMatch) {
          h.hbValue = parseInt(hbMatch[1], 10);
        }
      }
    });

    return new Response(JSON.stringify({ heats: extracted.heats }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Extract certificate error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
