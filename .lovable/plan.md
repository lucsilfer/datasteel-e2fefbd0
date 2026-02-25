

# Solucao definitiva: filtro pos-processamento no backend

## Problema

O modelo de IA ignora as instrucoes do prompt e continua mencionando "Carbono Equivalente (CE) de X.XX" no campo `aiInsights`, gerando valores divergentes do frontend (0.43 vs 0.500).

Alem disso, a corrida 563490 com grau "NRU-CG-QC-HB-180" deveria ter hbValue=180 detectado (REGRA 1), mas a IA parece ter aplicado REGRA 2 (CE), indicando falha na extracao do HB do nome do material.

## Solucao

Abordagem em duas camadas:

### 1. Filtro pos-processamento (garantia deterministica)

Apos receber o `aiInsights` da IA, aplicar regex no backend para remover qualquer frase que mencione CE ou Carbono Equivalente antes de retornar ao frontend. Isso funciona independentemente do que o modelo gerar.

Regex para limpar:
- Frases contendo "Carbono Equivalente", "CE de", "CE =", "CE:", "(CE)" seguido de valor numerico
- Remove a frase inteira (ate o ponto final) que contenha essas mencoes

### 2. Reforco no prompt sobre HB no nome do material

Adicionar exemplo explicito no prompt para que a IA detecte HB embutido no grau do material (ex: "NRU-CG-QC-HB-180" -> hbValue=180), garantindo que REGRA 1 seja aplicada corretamente.

## Alteracoes tecnicas

### Arquivo: `supabase/functions/extract-certificate/index.ts`

**A) Adicionar funcao de limpeza** (antes do `return` final):

```typescript
function cleanCEMentions(text: string): string {
  // Remove sentences mentioning CE or Carbon Equivalent
  return text
    .replace(/[^.]*(?:Carbono Equivalente|CE\s*(?:de|=|:|\()\s*\d)[^.]*\.\s*/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}
```

Aplicar a cada heat antes de retornar:
```typescript
extracted.heats.forEach(h => {
  if (h.aiInsights) h.aiInsights = cleanCEMentions(h.aiInsights);
});
```

**B) Melhorar instrucao de HB no prompt** (reforcar item 3b):

Tornar o exemplo mais explicito com o padrao exato "NRU-CG-QC-HB-180":
```
b) Valor HB embutido no nome/grau do material.
   Exemplo: "NRU-CG-QC-HB-180" contem HB 180.
   Se o grau contém "HB" seguido de um número (HB-180, HB320, HB 400),
   extraia esse número como hbValue.
```

### Resultado esperado

- O `aiInsights` nunca mais contera mencoes a CE ou valores numericos de Carbono Equivalente
- Materiais com HB no nome do grau terao hbValue corretamente preenchido
- REGRA 1 sera aplicada para materiais com HB, focando em tratamento termico

