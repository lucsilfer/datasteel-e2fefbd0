

# Reforcar proibicao de mencionar CE numerico no parecer da IA

## Problema

Apesar da instrucao existente (linha 114-116) pedindo para nao mencionar o valor numerico do CE, o modelo continua citando "Carbono Equivalente de 0.56" no texto. Alem de redundante, o valor calculado pela IA (0.56) diverge do calculado pelo frontend (0.441), gerando confusao.

## Causa

A instrucao atual e suave demais e esta posicionada longe das regras principais. O modelo a ignora em favor do padrao natural de "explicar o CE".

## Solucao

Reforcar a proibicao em dois pontos do prompt:

### 1. Na REGRA 2 (linha 97-116)

Tornar a instrucao mais enfatica e posiciona-la imediatamente apos a definicao da formula, antes das faixas:

```
REGRA 2 - Se hbValue for null, calcule o Carbono Equivalente (CE):
CE = C + Mn/6 + (Cr+Mo+V)/5 + (Cu+Ni)/15

PROIBIDO: Jamais cite o valor numerico do CE no texto do parecer.
Nao escreva frases como "o CE e de 0.XX" ou "Carbono Equivalente de X".
O valor ja e exibido na interface. Apenas use a faixa para definir o tom.

E aplique a faixa correspondente:
...
```

### 2. Na secao final de regras (linha 122)

Adicionar reforco explicito junto a regra de nao repetir valores:

```
- NAO repita valores numericos, percentuais, CE ou status ja visiveis nos outros campos
```

### Arquivo alterado

`supabase/functions/extract-certificate/index.ts` — apenas o texto do prompt (linhas 97-122).

Nenhum outro arquivo precisa ser alterado. A edge function sera reimplantada automaticamente.

