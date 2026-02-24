
# Ajustes Mobile no AnalysisCard + Prompt da IA

## Resumo
Corrigir o layout mobile do card de analise (sem alterar o desktop) e ajustar o prompt da IA para nao mencionar tratamento termico quando nao houver HB.

## Mudancas

### 1. `src/components/AnalysisCard.tsx` - Apenas ajustes mobile (via classes responsivas)

**ElementPill - Espacamento entre simbolo e valor:**
- Adicionar `gap-2` explicito e `min-w-0` para evitar colapso no mobile

**Score A36 acima da composicao no mobile:**
- Mudar o container de `flex gap-5` para `flex flex-col-reverse sm:flex-row sm:gap-5`
- No mobile o gauge aparece primeiro (acima), no desktop continua ao lado direito

**Tabs - Texto passando dos limites:**
- Esconder icones no mobile: classe `hidden sm:inline` nos icones das tabs
- Reduzir fonte no mobile: `text-[11px] sm:text-xs`
- Adicionar `overflow-hidden` no TabsList

### 2. `supabase/functions/extract-certificate/index.ts` - Ajuste no prompt

Alterar a instrucao do `aiInsights` para quando `hbValue` for null:

**De:**
```
- Se hbValue for null: foque na aplicabilidade prática baseada na composição
  (estrutural, naval, caldeiraria, vasos de pressão, etc)
```

**Para:**
```
- Se hbValue for null: NÃO mencione tratamento térmico, têmpera, dureza, 
  endurecimento ou ausência de HB. Foque EXCLUSIVAMENTE na composição 
  química e aplicações práticas do material (estrutural, naval, caldeiraria, 
  vasos de pressão, etc)
```

## Arquivos modificados
1. `src/components/AnalysisCard.tsx` - Layout responsivo (apenas classes mobile, desktop intacto)
2. `supabase/functions/extract-certificate/index.ts` - Prompt do parecer IA
