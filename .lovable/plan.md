

# Correção dos Bugs do Sistema de Créditos

## Diagnóstico

### Bug 1: Saldo não atualiza na tela após análise
**Causa raiz**: O componente `CreditBalance` depende exclusivamente do Supabase Realtime para atualizar. O débito acontece no servidor (via service role na Edge Function), e a notificação Realtime pode não chegar ao cliente de forma confiável. Resultado: o saldo exibido fica "congelado" mesmo após o débito no banco.

**Solução**: Além do Realtime, expor uma função `refresh` no `CreditBalance` e chamá-la manualmente no `Dashboard` após cada análise concluída (sucesso ou erro de créditos). Isso garante que o saldo sempre reflita o valor real.

### Bug 2: Erro genérico em vez de mensagem amigável
**Causa raiz**: Quando a Edge Function retorna HTTP 402 (créditos insuficientes), o `supabase.functions.invoke()` trata como erro e coloca a resposta no objeto `error`, não em `data`. O código do Dashboard verifica `error` na linha 44 e mostra "Erro ao processar o certificado" sem ler a mensagem real que está dentro do erro.

**Solução**: Extrair o corpo da resposta do objeto `error.context` (que é o Response HTTP original) para obter a mensagem amigável retornada pela Edge Function ("Créditos insuficientes. Adquira mais créditos para continuar.").

### Bug 3: Saldo zerou após logout/login
**Causa**: Isso é comportamento correto. O banco confirma 3 débitos realizados (3 créditos bônus - 3 usos = 0). O problema é que o usuário não viu os débitos acontecendo (Bug 1), então pareceu que zerou de repente.

## Arquivos Modificados

### 1. `src/components/CreditBalance.tsx`
- Exportar a função `fetchBalance` para que o Dashboard possa chamá-la
- Usar `forwardRef` + `useImperativeHandle` para expor um método `refresh()`
- Manter o Realtime como atualização secundária

### 2. `src/pages/Dashboard.tsx`
- Criar uma `ref` para o `CreditBalance`
- Após cada chamada ao `extract-certificate` (sucesso ou erro), chamar `creditBalanceRef.current?.refresh()`
- Corrigir o tratamento de erro para ler a mensagem da Edge Function:

```text
Antes:
  if (error) -> toast genérico

Depois:
  if (error) -> tentar ler error.context.json() -> mostrar data.error
  se não conseguir -> fallback para toast genérico
```

## Detalhes Técnicos

### CreditBalance com ref

```text
const CreditBalance = forwardRef((props, ref) => {
  const fetchBalance = async () => { ... };
  
  useImperativeHandle(ref, () => ({
    refresh: fetchBalance
  }));
  
  // ... resto do componente igual
});
```

### Tratamento de erro no Dashboard

```text
if (error) {
  let errorMessage = 'Erro ao processar o certificado. Tente novamente.';
  
  // Tentar extrair mensagem amigável da resposta
  try {
    const errorBody = await error.context?.json();
    if (errorBody?.error) {
      errorMessage = errorBody.error;
    }
  } catch {}
  
  toast.error(errorMessage);
  creditBalanceRef.current?.refresh(); // Atualizar saldo mesmo em erro
  return;
}
```

### Refresh após sucesso

```text
// Após análise bem-sucedida
toast.success(`${analyzed.length} corrida(s) analisada(s) com sucesso!`);
creditBalanceRef.current?.refresh(); // Atualizar saldo
```

## Resumo das Mudanças

| Arquivo | Mudança |
|---------|---------|
| `CreditBalance.tsx` | Adicionar forwardRef + useImperativeHandle para expor refresh() |
| `Dashboard.tsx` | Criar ref, chamar refresh após análise, extrair mensagem de erro do context |

Nenhuma mudança no banco de dados ou nas Edge Functions é necessária -- a lógica do servidor está funcionando corretamente.
