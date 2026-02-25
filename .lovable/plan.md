

# Trocar logo e favicon do DataSteel

## Resumo

Substituir o icone generico `FlaskConical` (lucide) pela imagem do logo DataSteel enviada, em todas as paginas e no favicon.

## Alteracoes

### 1. Copiar a imagem para o projeto

- Copiar `user-uploads://Logo_Datasteel_2000 x 1000 px.png` para `public/logo-datasteel.png` (favicon e HTML)
- Copiar tambem para `src/assets/logo-datasteel.png` (uso em componentes React via import)

### 2. Favicon (`index.html`)

Adicionar tag `<link rel="icon">` apontando para `/logo-datasteel.png`.

### 3. Substituir FlaskConical pela imagem do logo em 6 arquivos:

| Arquivo | Local | Mudanca |
|---------|-------|---------|
| `src/pages/Landing.tsx` | Header (linha 37) | `<img src>` no lugar de `<FlaskConical>` |
| `src/pages/Landing.tsx` | Hero (linha 53) | `<img src>` maior no lugar de `<FlaskConical>` |
| `src/pages/Auth.tsx` | Header (linha 52) e formulario (linha 61) | `<img src>` no lugar de `<FlaskConical>` |
| `src/pages/Dashboard.tsx` | Header (linha 128) | `<img src>` no lugar de `<FlaskConical>` |
| `src/pages/Index.tsx` | Header (linha 61) | `<img src>` no lugar de `<FlaskConical>` |
| `src/pages/Admin.tsx` | Header (linha 165) | `<img src>` no lugar de `<FlaskConical>` |

Em cada caso, o `<FlaskConical>` sera substituido por uma tag `<img>` com o logo importado de `@/assets/logo-datasteel.png`, mantendo tamanhos proporcionais (h-6 nos headers, h-10 no hero da landing).

O import de `FlaskConical` sera removido dos arquivos onde nao for mais usado.

### 4. PrintReport (`src/components/PrintReport.tsx`)

Se houver referencia ao icone no relatorio de impressao, tambem sera atualizado para usar a URL da imagem no `public/`.

