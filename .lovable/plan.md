

# Redesign Visual Profissional - Estilo Corporativo com Azul

## Objetivo

Transformar o visual atual (tema escuro com glassmorphism) em um visual corporativo profissional inspirado na referencia (Extranet Usiminas), substituindo o verde pelo azul como cor destaque. O layout ficara com fundo claro, cards brancos com bordas sutis e tipografia limpa.

## Mudancas Visuais

### Antes vs Depois

```text
ANTES                          DEPOIS
- Fundo escuro azul            - Fundo cinza claro (#f5f7fa)
- Cards com glassmorphism      - Cards brancos com sombra sutil
- Bordas com glow neon         - Bordas cinza discretas
- Texto claro sobre escuro     - Texto escuro sobre claro
- Efeitos de blur/glow         - Visual limpo e corporativo
```

### Paleta de Cores (azul no lugar do verde)

| Elemento | Cor |
|----------|-----|
| Header | Azul escuro (#1e3a5f) |
| Fundo pagina | Cinza claro (#f5f7fa) |
| Cards | Branco com borda cinza |
| Botoes primarios | Azul (#2563eb) |
| Texto principal | Cinza escuro (#1a1a2e) |
| Texto secundario | Cinza medio (#64748b) |

## Detalhes Tecnicos

### 1. `src/index.css` - Nova paleta de variaveis CSS

Substituir as variaveis CSS do `:root` para um tema claro corporativo:
- `--background`: branco/cinza claro
- `--foreground`: cinza escuro
- `--card`: branco puro
- `--primary`: azul (#2563eb)
- `--border`: cinza claro
- Remover efeitos de glow das classes utilitarias (.glass-card, .glow-border)
- Substituir `.glass-card` por card branco com sombra sutil e borda cinza

### 2. `src/pages/Landing.tsx` - Landing page corporativa

- Header com fundo azul escuro solido (como o header da referencia)
- Remover gradiente de fundo radial
- Cards de features com fundo branco e borda cinza
- Botao CTA azul solido sem animacao de pulse-glow
- Footer com borda superior cinza

### 3. `src/pages/Auth.tsx` - Tela de login limpa

- Fundo cinza claro
- Card de login branco com sombra
- Remover efeitos de glassmorphism

### 4. `src/pages/Dashboard.tsx` - Dashboard profissional

- Header azul escuro solido (estilo barra de navegacao corporativa)
- Fundo cinza claro
- Remover gradiente de fundo

### 5. `src/components/ImageUpload.tsx` - Upload limpo

- Remover efeito de glow no hover
- Borda tracejada cinza, fundo branco
- Estilo mais simples e corporativo

### 6. `src/components/AnalysisCard.tsx` - Cards de resultado

- Card branco com borda cinza e sombra leve
- Substituir `.glass-card` por estilo de card branco
- Tabs com estilo mais limpo
- Manter os indicadores de status (SAFE/WARNING/CRITICAL) com as mesmas cores

### Arquivos modificados:
1. `src/index.css` - Variaveis CSS e classes utilitarias
2. `src/pages/Landing.tsx` - Layout e estilos
3. `src/pages/Auth.tsx` - Estilos do card de login
4. `src/pages/Dashboard.tsx` - Header e fundo
5. `src/components/ImageUpload.tsx` - Estilo do upload
6. `src/components/AnalysisCard.tsx` - Estilo dos cards de resultado

