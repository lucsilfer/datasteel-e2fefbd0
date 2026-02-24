

# Landing Page + Autenticacao de Usuarios

## Objetivo

Criar uma landing page publica como tela inicial do DataSteel, com chamada para o proposito da ferramenta (analise quimica via IA para reclassificacao de chapas de aco de desvio - NTU, NRU, NIR, QC), e um sistema de login/cadastro para proteger o acesso a ferramenta de analise.

## Estrutura de Paginas

```text
/              -> Landing Page (publica)
/auth          -> Login / Cadastro
/dashboard     -> Ferramenta de analise (protegida, conteudo atual do Index)
```

## Mudancas

### 1. Banco de Dados

Nenhuma tabela de perfil necessaria neste momento -- apenas autenticacao basica (email + senha) usando o sistema de autenticacao integrado do Lovable Cloud.

**Importante**: Confirmacao de email sera desabilitada para facilitar o uso inicial (auto-confirm habilitado), a menos que voce prefira que os usuarios confirmem por email antes de acessar.

### 2. Novas Paginas

**`src/pages/Landing.tsx`** - Landing page publica com:
- Hero section com titulo grande "DataSteel" em texto gradiente
- Subtitulo explicando o proposito: analise quimica via IA para reclassificacao de chapas de aco de desvio (NTU, NRU, NIR, QC)
- Secao de features com icones: Upload de certificados, Analise por IA, Compatibilidade A36, Parecer tecnico
- Botao CTA "Acessar Plataforma" que direciona para `/auth`
- Estilo glass-card e glow consistente com o tema atual

**`src/pages/Auth.tsx`** - Pagina de autenticacao com:
- Formulario de login (email + senha)
- Formulario de cadastro (email + senha)
- Toggle entre login e cadastro
- Estilo glass-card integrado ao tema escuro
- Redirect automatico para `/dashboard` apos login

**`src/pages/Dashboard.tsx`** - Conteudo atual do Index movido para ca:
- Header com botao de logout
- Toda a logica de upload e analise existente
- Rota protegida (redireciona para `/auth` se nao autenticado)

### 3. Componente de Protecao de Rota

**`src/components/ProtectedRoute.tsx`**:
- Verifica sessao ativa via `onAuthStateChange`
- Redireciona para `/auth` se nao autenticado
- Mostra loading enquanto verifica

### 4. Rotas (`src/App.tsx`)

Atualizar para incluir as 3 rotas:
- `/` -> Landing (publica)
- `/auth` -> Auth (publica, redireciona para dashboard se ja logado)
- `/dashboard` -> Dashboard (protegida)

## Detalhes Tecnicos

### Arquivos criados:
1. **`src/pages/Landing.tsx`** - Hero + features + CTA
2. **`src/pages/Auth.tsx`** - Login/cadastro com Supabase Auth
3. **`src/pages/Dashboard.tsx`** - Conteudo migrado do Index atual + logout
4. **`src/components/ProtectedRoute.tsx`** - Guard de autenticacao

### Arquivos modificados:
1. **`src/App.tsx`** - Novas rotas
2. **`src/pages/Index.tsx`** - Redirecionamento para Landing

### Configuracao:
- Habilitar auto-confirm de email no Supabase Auth (para nao exigir verificacao por email)
- Usar `supabase.auth.signUp()`, `signInWithPassword()`, `signOut()`
- Listener `onAuthStateChange` para gerenciar estado de sessao

### Landing Page - Secoes:

1. **Hero**: Logo DataSteel + "Analise quimica inteligente para reclassificacao de chapas de aco" + "Transforme certificados de qualidade em insights tecnicos para materiais de desvio (NTU, NRU, NIR, QC)" + botao CTA
2. **Features** (grid 2x2):
   - Upload de Certificados - Envie fotos ou PDFs de certificados de qualidade
   - Analise por IA - Extracao automatica de composicao quimica via inteligencia artificial
   - Compatibilidade A36 - Indice ponderado de similaridade com ASTM A36
   - Parecer Tecnico - Avaliacao de aplicabilidade considerando dureza e tratamento termico
3. **Footer** simples com copyright

