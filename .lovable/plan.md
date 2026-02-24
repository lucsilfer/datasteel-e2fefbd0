
# Aprimorar Calculo de Similaridade A36

## Problema

O calculo atual do indice de compatibilidade com A36 (linhas 77-82 de `src/utils/calculations.ts`) usa uma formula simplista com pesos arbitrarios e apenas 3 elementos (C, Mn, Mo):

```
score = 100
score -= |C - 0.18| * 100
score -= |Mn - 0.71| * 10
score -= |Mo - 0.28| * 50
```

Isso nao reflete a importancia real dos fatores na similaridade com o A36.

## Solucao

Substituir por um sistema de pontuacao ponderada baseado nos pesos definidos pelo usuario:

| Fator | Peso | Valor referencia A36 | Faixa aceitavel |
|-------|------|---------------------|-----------------|
| CE (Carbono Equivalente) | 5 | 0.35 | 0 - 0.40 (SAFE) |
| C (Carbono) | 2 | 0.18 | 0 - 0.22 (SAFE) |
| Mn (Manganes) | 2 | 0.71 | 0 - 1.00 (SAFE) |
| P (Fosforo) | 0.5 | 0.012 | 0 - 0.030 (SAFE) |
| S (Enxofre) | 0.5 | 0.015 | 0 - 0.020 (SAFE) |

**Peso total: 10**

### Logica de calculo

Para cada fator, calcular uma pontuacao individual de 0 a 1 baseada em quao proximo o valor esta da faixa ideal do A36:

- **CE**: score = 1.0 se CE <= 0.40; decresce linearmente ate 0 quando CE >= 0.60
- **C**: score = 1.0 se C <= 0.22; decresce linearmente ate 0 quando C >= 0.35
- **Mn**: score = 1.0 se Mn <= 1.00; decresce linearmente ate 0 quando Mn >= 1.60
- **P**: score = 1.0 se P <= 0.030; decresce linearmente ate 0 quando P >= 0.050
- **S**: score = 1.0 se S <= 0.020; decresce linearmente ate 0 quando S >= 0.050

Formula final:

```
index = ((scoreCE * 5) + (scoreC * 2) + (scoreMn * 2) + (scoreP * 0.5) + (scoreS * 0.5)) / 10 * 100
```

Materiais HB continuam com `compatibilityIndex = 0` (incompativeis com A36 por definicao).

## Detalhes Tecnicos

### Arquivo modificado: `src/utils/calculations.ts`

Substituir as linhas 77-82 (bloco `else` do calculo de compatibilidade) por:

```typescript
// Pontuacao individual por fator (0 a 1)
const scoreElement = (val: number | null, maxSafe: number, maxRange: number): number => {
  if (val === null) return 1; // sem dado = neutro
  if (val <= maxSafe) return 1;
  if (val >= maxRange) return 0;
  return 1 - (val - maxSafe) / (maxRange - maxSafe);
};

const scoreCE = scoreElement(ce, 0.40, 0.60);
const scoreC  = scoreElement(extracted.elements.C, 0.22, 0.35);
const scoreMn = scoreElement(extracted.elements.Mn, 1.00, 1.60);
const scoreP  = scoreElement(extracted.elements.P, 0.030, 0.050);
const scoreS  = scoreElement(extracted.elements.S, 0.020, 0.050);

const weightedScore = (scoreCE * 5) + (scoreC * 2) + (scoreMn * 2) + (scoreP * 0.5) + (scoreS * 0.5);
const totalWeight = 10;
compatibilityIndex = Math.round((weightedScore / totalWeight) * 100);
```

Nenhum outro arquivo precisa ser alterado -- o `CircularGauge` no `AnalysisCard.tsx` ja exibe o valor de `compatibilityIndex` corretamente.
