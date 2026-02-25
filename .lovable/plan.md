

# Corrigir divergencia do CE entre o parecer IA e o card

## Problema

O parecer da IA (aiInsights) menciona um valor de CE calculado internamente pelo modelo de linguagem, que pode divergir do CE calculado pelo frontend (`src/utils/calculations.ts`). Isso ocorre porque o modelo faz o calculo "de cabeca" e pode arredondar de forma diferente, enquanto o frontend usa a formula exata com precisao numerica.

## Solucao

Adicionar uma instrucao explicita no prompt para que a IA **nunca mencione o valor numerico do CE** no parecer. O CE ja e exibido no card com badge colorido, entao repeti-lo no texto e redundante e gera confusao quando os valores divergem.

A IA continuara usando a logica das faixas de CE para determinar o tom do parecer (otimo / cuidado / processos especiais), mas sem citar o numero.

## Detalhe tecnico

### Arquivo: `supabase/functions/extract-certificate/index.ts`

Na secao do prompt referente a REGRA 2, adicionar a seguinte instrucao apos as faixas de CE:

```
NÃO mencione o valor numérico do CE no parecer, pois ele já é calculado
e exibido separadamente na interface. Apenas aplique a faixa correspondente
para definir o tom da análise.
```

Isso sera inserido junto as demais restricoes existentes (antes de "Em todos os casos da REGRA 2...").

Nenhum outro arquivo precisa ser alterado.

