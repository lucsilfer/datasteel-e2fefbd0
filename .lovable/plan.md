

# Redesign Visual - Estilo SteelCert Analyzer

## Objetivo

Aplicar o design system do projeto de referencia ao projeto atual: tema escuro permanente com glassmorphism, efeitos de glow, texto gradiente e layout mais limpo e profissional.

## Mudancas

### 1. Tema e CSS (`src/index.css`)

Substituir o sistema dual (light/dark) por um tema escuro unico inspirado no projeto de referencia:

- Fundo escuro azulado (`222 47% 6%`)
- Cards com fundo `222 40% 10%`
- Primary azul vibrante (`217 91% 60%`)
- Adicionar variaveis custom: `--steel-*`, `--success`, `--gradient-*`, `--shadow-glow`
- Adicionar classes utilitarias: `.glass-card`, `.glow-border`, `.text-gradient`
- Adicionar animacoes: `fadeIn`, `slideUp`, `pulseGlow`
- Importar fonte JetBrains Mono para valores numericos

### 2. Tailwind Config (`tailwind.config.ts`)

- Adicionar `fontFamily`: `sans`, `display`, `mono` (JetBrains Mono)
- Adicionar cores `steel` (escala 50-900) e `success`/`info`
- Manter cores `safe`, `warning`, `critical` existentes

### 3. Header e Layout (`src/pages/Index.tsx`)

- Header: estilo `glass-card` com backdrop-blur, logo com `text-gradient`
- Remover icone em caixa gradiente, usar icone direto com `text-primary`
- Remover `ThemeToggle` (tema unico escuro)
- Manter estrutura funcional identica

### 4. Upload (`src/components/ImageUpload.tsx`)

- Usar classe `glass-card` no container
- Borda `glow-border` no hover
- Manter toda a logica de drag/drop e preview

### 5. Card de Analise (`src/components/AnalysisCard.tsx`)

- Usar `glass-card` ao inves de `bg-card/80`
- Elementos quimicos com fundo `bg-muted/30` mais sutil
- Tabs com estilo mais limpo
- Gauge circular mantido, ajustado para combinar com novo tema

## Detalhes Tecnicos

### Arquivos modificados:

1. **`src/index.css`** - Substituir variaveis CSS por tema escuro unico + adicionar utilitarios (glass-card, text-gradient, glow-border, animacoes)
2. **`tailwind.config.ts`** - Adicionar fontFamily (Inter, JetBrains Mono), cores steel/success/info
3. **`src/pages/Index.tsx`** - Redesign header com text-gradient, remover ThemeToggle
4. **`src/components/ImageUpload.tsx`** - Aplicar glass-card e glow-border
5. **`src/components/AnalysisCard.tsx`** - Aplicar glass-card, ajustar cores dos elementos

### Paleta de cores (tema unico escuro):

| Token | Valor HSL |
|-------|-----------|
| background | 222 47% 6% |
| card | 222 40% 10% |
| primary | 217 91% 60% |
| border | 217 20% 18% |
| muted | 217 20% 14% |
| muted-foreground | 215 15% 55% |

### Classes utilitarias adicionadas:

- `.glass-card` - bg-card/80 + backdrop-blur-xl + border-border/50 + shadow
- `.glow-border` - border-primary/30 + shadow glow azul
- `.text-gradient` - gradiente azul no texto (from-primary to-blue-400)

