
# Mudancas: Ocultar Upload + Novo Sistema Data Score (DS)

## 1. Ocultar area de upload quando houver resultados

Quando `results.length > 0`, o componente `ImageUpload` sera escondido no `Dashboard.tsx`. Um botao compacto "Nova Analise" aparecera no topo dos resultados para permitir ao usuario limpar os resultados e voltar ao upload. Isso libera espaco vertical para os cards de analise.

## 2. Novo sistema de pontuacao: Data Score (DS)

Substituir o conceito "compatibilidade A36" pelo **Data Score (DS)**, uma escala de 0 a 1000.

### Faixas de cor:
| Faixa | Cor | Status |
|-------|-----|--------|
| DS > 800 | Verde | SAFE |
| 700 - 800 | Amarelo | WARNING |
| DS < 700 | Vermelho | CRITICAL |

### Calculo
O calculo atual gera um `compatibilityIndex` de 0-100 (percentual). Para converter em DS (0-1000), basta multiplicar por 10. Para materiais com HB (tempera), o DS permanece 0.

## Detalhes tecnicos

### `src/utils/calculations.ts`
- Alterar `compatibilityIndex` de escala 0-100 para 0-1000:
  - Linha 91: `Math.round((weightedScore / 10) * 1000)` em vez de `* 100`
  - Materiais com HB: manter `compatibilityIndex = 0`
- Remover referencias textuais a "A36" nas strings de justification (linha 70)

### `src/types/index.ts`
- Nenhuma mudanca estrutural necessaria -- `compatibilityIndex` continua como `number`, apenas muda a escala

### `src/components/AnalysisCard.tsx`
- **CircularGauge**: Atualizar para escala 0-1000
  - Valor exibido: `{value}` sem `%`, com label "DS" em vez de "A36"
  - Cores: `value > 800` verde, `value > 700` amarelo, senao vermelho
  - Calculo do arco: `offset = circumference - (value / 1000) * circumference`
- Remover qualquer texto "A36" ou "similaridade"

### `src/pages/Dashboard.tsx`
- Envolver `ImageUpload` em condicional: so renderiza quando `results.length === 0`
- Adicionar botao "Nova Analise" acima dos resultados que limpa `results` e `showNoCreditsBanner`
- Remover `max-w-5xl` do main (ou aumentar para `max-w-6xl`) para cards maiores

### `src/pages/Index.tsx`
- Mesma logica de ocultar upload quando ha resultados (se esta pagina ainda for usada)
