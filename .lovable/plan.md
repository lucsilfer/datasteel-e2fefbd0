
# Melhorar Parecer IA + Score A36 Circular

## 1. Refinar o prompt do aiInsights na edge function

O campo `aiInsights` atual e muito generico -- repete informacoes que ja estao visiveis nos controles (composicao, CE, etc). O prompt sera reescrito para instruir a IA a focar em:

- **Aplicabilidade pratica**: para que tipos de aplicacao este material e indicado (estrutural, naval, caldeiraria, etc)
- **Explicacao dos elementos relevantes**: breve contexto sobre o papel dos elementos que se destacam (ex: "O teor de Cr de 0.25% confere leve resistencia a corrosao mas pode impactar soldabilidade")
- **Nao repetir** valores numericos, status ou informacoes ja exibidas nas outras abas

Trecho do prompt alterado (item 5):
```
5. Um parecer técnico (aiInsights) em português com foco em:
   - Aplicabilidade prática do material (para quais usos é indicado)
   - Breve explicação do papel dos elementos químicos que se destacam
   - NÃO repita valores numéricos ou status já visíveis nos outros campos
   - Seja conciso e focado em informações úteis para tomada de decisão
```

## 2. Substituir barra de compatibilidade A36 por marcador circular (gauge)

Atualmente o score de compatibilidade A36 e uma barra horizontal simples. Sera substituido por um **marcador circular SVG** com:

- Arco de progresso colorido (verde/amarelo/vermelho conforme o score)
- Porcentagem grande no centro
- Label "A36" abaixo
- Animacao suave de preenchimento
- Posicionado ao lado da grid de elementos quimicos

### Arquivos modificados:

1. **`supabase/functions/extract-certificate/index.ts`** (linha 47)
   - Reescrever instrucao do `aiInsights` no prompt para ser menos generico e focar em aplicabilidade + contexto dos elementos

2. **`src/components/AnalysisCard.tsx`**
   - Criar componente `CircularGauge` com SVG para o score A36
   - Substituir a barra horizontal pelo gauge circular na aba "Composicao"
   - Reorganizar layout: gauge ao lado da grid de elementos

### Componente CircularGauge (novo, inline no AnalysisCard):

```text
    ┌─────────────┐
    │   ╭─────╮   │
    │  ╱  87%  ╲  │
    │ │         │ │
    │  ╲       ╱  │
    │   ╰─────╯   │
    │     A36      │
    └─────────────┘
```

- SVG com `stroke-dasharray` e `stroke-dashoffset` para o arco
- Cor dinamica: safe (>70), warning (40-70), critical (<40)
- Transicao CSS no `stroke-dashoffset` para animacao de entrada
