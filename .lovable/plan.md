
# Correção: Contador de Créditos Sumindo Após Compra

## Problema

Quando o usuário retorna do Mercado Pago para o Dashboard (com `?payment=success`), o componente `CreditBalance` busca o saldo uma vez na montagem. Porém:

1. O webhook do Mercado Pago pode ainda nao ter processado naquele instante, entao o saldo retorna 0
2. O codigo no `useEffect` de pagamento mostra o toast "Pagamento aprovado!" mas nao chama `refresh()` no CreditBalance
3. O Realtime pode nao entregar a atualizacao de forma confiavel (a atualizacao foi feita pelo service role no webhook)
4. Resultado: o usuario ve "0" creditos (ou o contador "some" se o componente nao renderiza com saldo null)

## Solucao

Modificar o `useEffect` de pagamento no Dashboard para:

1. Chamar `creditBalanceRef.current?.refresh()` imediatamente quando `payment=success`
2. Fazer mais 2-3 tentativas com delay (ex: 2s, 5s, 10s) para cobrir o caso em que o webhook ainda nao processou
3. Esconder o banner de "creditos insuficientes" ao retornar com pagamento bem-sucedido

## Arquivo Modificado

### `src/pages/Dashboard.tsx`

Atualizar o `useEffect` de pagamento (linhas 25-32):

```text
useEffect(() => {
  const payment = searchParams.get('payment');
  if (payment === 'success') {
    toast.success('Pagamento aprovado! Seus creditos foram adicionados.');
    setShowNoCreditsBanner(false);
    
    // Refresh imediato + retentativas com delay
    creditBalanceRef.current?.refresh();
    const delays = [2000, 5000, 10000];
    const timers = delays.map(delay =>
      setTimeout(() => creditBalanceRef.current?.refresh(), delay)
    );
    
    return () => timers.forEach(clearTimeout);
  } else if (payment === 'failure') {
    toast.error('Pagamento nao concluido. Tente novamente.');
  }
}, [searchParams]);
```

Isso garante que, mesmo que o webhook demore alguns segundos para processar, o saldo sera atualizado na tela.

## Resumo

| Arquivo | Mudanca |
|---------|---------|
| `Dashboard.tsx` | Adicionar refresh com retentativas apos retorno de pagamento bem-sucedido |
