import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

    const { base64Image } = await req.json();
    if (!base64Image) {
      return new Response(JSON.stringify({ error: "No image provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const imageData = base64Image.includes(",") ? base64Image.split(",")[1] : base64Image;

    const prompt = `Analise este certificado de aço e realize uma varredura cíclica para identificar todas as corridas (Heats) presentes.
              
Para CADA corrida encontrada (identificada por termos como "Corrida", "Heat" ou "Heat No"), extraia:
1. O número da corrida.
2. A composição química (C, Si, Mn, P, S, Cr, Mo, Ni, Cu, V). Se um elemento não estiver presente, retorne null.
3. O valor de Dureza Brinell (HB). MONITORE RIGOROSAMENTE o campo de propriedades mecânicas e observações em busca da unidade 'HB' ou 'Brinell'. Se detectar qualquer menção a HB (ex: HB 280, 400), extraia o valor numérico. Se não houver, retorne null.
4. Dimensões e o grau do material vinculados àquela corrida.
5. Um parecer técnico (aiInsights) em português focado na qualidade do material para aquela corrida específica.

REGRAS IMPORTANTES:
- Fidelidade aos Dados: Se um elemento químico ou o valor de HB não estiver presente, retorne null. Não especule valores.
- Isolamento: A composição química e a dureza (HB) devem estar estritamente vinculadas ao seu respectivo número de corrida.
- Detecção de HB: A presença de HB é um gatilho crítico para segurança operacional. Priorize a varredura deste campo.

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
                image_url: { url: `data:image/jpeg;base64,${imageData}` },
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
                        dimensions: { type: "string" },
                        materialGrade: { type: "string" },
                        aiInsights: { type: "string" },
                      },
                      required: ["heatNumber", "elements", "dimensions", "materialGrade", "aiInsights"],
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
      return new Response(JSON.stringify({ error: "Erro ao processar imagem" }), {
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
