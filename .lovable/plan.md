
# Plano: Suporte a PDF + Interface Moderna

## Problema 1: PDF nao funciona

O componente de upload atualmente:
- Aceita apenas `image/*` no input de arquivo
- Rejeita qualquer arquivo que nao seja imagem no codigo
- O modelo de IA espera receber uma imagem, nao um PDF diretamente

**Solucao:** Converter o PDF em imagem no backend (edge function) usando a biblioteca `pdf.js` ou, de forma mais simples, aceitar o PDF como base64 e enviar diretamente ao modelo Gemini que suporta PDFs nativamente via mime type `application/pdf`.

Passos:
1. Alterar `ImageUpload.tsx` para aceitar `image/*,.pdf` no input
2. Remover a verificacao `file.type.startsWith('image/')` e aceitar tambem `application/pdf`
3. Mostrar um icone de PDF no preview em vez de tentar renderizar como imagem
4. Alterar a edge function para detectar o mime type (imagem vs PDF) e enviar o tipo correto ao modelo Gemini (que suporta ambos nativamente)

## Problema 2: Interface mais moderna

Redesign completo da pagina com:

### Header
- Logo mais sofisticado com gradiente
- Subtitulo com animacao sutil
- Dark mode toggle

### Area de Upload
- Design glassmorphism com blur e transparencia
- Animacao de pulso ao arrastar arquivos
- Icones maiores e mais expressivos
- Preview melhor para PDFs (icone + nome do arquivo)

### Cards de Resultado
- Layout com tabs para separar Composicao Quimica / Aplicabilidade / Parecer IA
- Barra de compatibilidade com gradiente animado
- Indicadores visuais mais claros com tooltips
- Grid responsivo melhorado
- Animacoes de entrada (fade-in) nos resultados

### Geral
- Adicionar dark mode com `next-themes`
- Transicoes suaves entre estados
- Tipografia mais refinada
- Espacamento e hierarquia visual melhorados

## Detalhes Tecnicos

### Arquivos a criar/modificar:

1. **`src/components/ImageUpload.tsx`** - Aceitar PDF, novo design glassmorphism, preview de PDF
2. **`supabase/functions/extract-certificate/index.ts`** - Detectar mime type e enviar corretamente ao Gemini
3. **`src/components/AnalysisCard.tsx`** - Redesign com tabs, tooltips, animacoes
4. **`src/pages/Index.tsx`** - Layout modernizado com dark mode toggle, animacoes de entrada
5. **`src/index.css`** - Adicionar animacoes customizadas e estilos glassmorphism
6. **`src/components/ThemeToggle.tsx`** (novo) - Botao de alternancia dark/light mode
7. **`src/App.tsx`** - Envolver com ThemeProvider do next-themes

### Fluxo do PDF corrigido:

```text
Usuario seleciona PDF
        |
        v
Frontend le como base64 (DataURL)
        |
        v
Envia para edge function
        |
        v
Edge function detecta mime type
(image/jpeg, image/png, application/pdf)
        |
        v
Envia ao Gemini com mime type correto
        |
        v
Retorna dados extraidos normalmente
```

### Dependencias existentes utilizadas:
- `next-themes` (ja instalado) para dark mode
- `lucide-react` para icones
- `@radix-ui/react-tabs` para tabs nos cards
- `@radix-ui/react-tooltip` para tooltips
