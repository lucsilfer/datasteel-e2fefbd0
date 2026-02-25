
# Separar Aplicabilidade em 3 cards: Dobra, Usinagem e Solda

## Resumo

Remover o card de "Desgaste" da aba Aplicabilidade e separar "Usinagem / Solda" em dois cards distintos: um para Usinagem e outro para Solda. Ambos seguirao as mesmas faixas de CE.

## Alteracoes

### 1. Tipo `AnalysisResult` (`src/types/index.ts`)

Substituir o campo `applicability` por:

```typescript
applicability?: {
  bendingAlert: string | null;
  machining: string;
  welding: string;
};
```

- Remove `wearResistance`
- Adiciona `welding` separado de `machining`

### 2. Logica de calculo (`src/utils/calculations.ts`)

Adicionar variavel `welding` junto a `bendingAlert` e `machining`, todas baseadas nas faixas de CE:

| Faixa CE | Dobra | Usinagem | Solda |
|----------|-------|----------|-------|
| CE <= 0,40 | Excelente para Dobra | Excelente para Usinagem | Excelente Soldabilidade |
| 0,40 < CE <= 0,44 | Requer cuidados na dobra | Requer cuidados na usinagem | Requer cuidados na soldagem |
| CE > 0,44 | Dobra somente a quente | Usinagem com ferramentas especiais | Soldagem com pre-aquecimento |

Remover `wearResistance` do objeto `applicability`.

### 3. Card de Aplicabilidade (`src/components/AnalysisCard.tsx`)

Substituir os 3 cards atuais (Desgaste, Dobra, Usinagem/Solda) por 3 novos cards:

- **Dobra** (icone Shapes) - exibe `bendingAlert`
- **Usinagem** (icone Wrench) - exibe `machining`
- **Solda** (icone Flame) - exibe `welding`

### 4. Relatorio de impressao (`src/components/PrintReport.tsx`)

Atualizar para refletir os 3 campos sem `wearResistance`.
