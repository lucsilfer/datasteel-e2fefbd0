

# Aplicar regras de CE na Aplicabilidade (Dobra, Solda e Usinagem)

## Problema

A aba "Aplicabilidade" usa criterios diferentes das faixas de CE:
- Dobra avalia apenas Cr < 0.10 (ignora CE)
- Solda avalia apenas CE < 0.40 (sem faixa intermediaria)

Isso gera contradicao: material com CE alto pode aparecer como "Excelente para Dobra".

## Solucao

Substituir a logica nas linhas 93-100 de `src/utils/calculations.ts` pelas 3 faixas de CE:

| Faixa CE | Dobra | Solda / Usinagem |
|----------|-------|------------------|
| CE <= 0,40 | Excelente para Dobra | Excelente Soldabilidade |
| 0,40 < CE <= 0,44 | Requer cuidados na dobra | Requer cuidados na soldagem |
| CE > 0,44 | Dobra somente a quente | Soldagem com pre-aquecimento |

## Detalhe tecnico

### Arquivo: `src/utils/calculations.ts` (linhas 93-100)

Substituir:
```typescript
const isGoodForWelding = ce < 0.40;
const isGoodForBending = (extracted.elements.Cr || 0) < 0.10;

applicability = {
  wearResistance: 'Baixa resistência ao desgaste abrasivo.',
  bendingAlert: isGoodForBending ? '✅ Excelente para Dobra' : '⚠️ Requer atenção na dobra',
  machining: isGoodForWelding ? '✅ Excelente Soldabilidade' : '⚠️ Requer cuidados na soldagem'
};
```

Por:
```typescript
let bendingAlert: string;
let machining: string;

if (ce <= 0.40) {
  bendingAlert = '✅ Excelente para Dobra';
  machining = '✅ Excelente Soldabilidade';
} else if (ce <= 0.44) {
  bendingAlert = '⚠️ Requer cuidados na dobra';
  machining = '⚠️ Requer cuidados na soldagem';
} else {
  bendingAlert = '🔴 Dobra somente a quente com processos especiais';
  machining = '🔴 Soldagem somente com pré-aquecimento e processos especiais';
}

applicability = {
  wearResistance: 'Baixa resistência ao desgaste abrasivo.',
  bendingAlert,
  machining
};
```

Nenhum outro arquivo precisa ser alterado.
