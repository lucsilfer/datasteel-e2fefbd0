

# Correção: Mensagem Amigável ao Acabar Créditos

## Problema

Quando os créditos acabam e o usuário tenta analisar um certificado, aparece um erro genérico ou nenhuma mensagem clara. O código atual tenta extrair a mensagem do erro, mas falha silenciosamente porque não importa o tipo correto de erro (`FunctionsHttpError`) do Supabase.

## Solução

Duas melhorias:

### 1. Corrigir a extração da mensagem de erro

Importar `FunctionsHttpError` do Supabase e verificar o tipo do erro antes de tentar ler `error.context.json()`.

### 2. Mostrar um alerta visual (não apenas um toast)

Quando os créditos acabam, em vez de apenas um toast que desaparece, exibir um banner/alerta persistente na tela com um botão para comprar créditos. Isso incentiva a conversão.

## Arquivos Modificados

### `src/pages/Dashboard.tsx`

- Importar `FunctionsHttpError` de `@supabase/supabase-js`
- No tratamento de erro:
  - Verificar se `error instanceof FunctionsHttpError`
  - Se sim, ler `error.context.json()` para obter a mensagem real
  - Detectar se é erro de créditos (status 402) e mostrar um estado visual especial
- Adicionar um estado `showNoCreditsBanner` que exibe um alerta na tela com botão "Comprar Créditos"

### Lógica de erro atualizada

```text
if (error) {
  if (error instanceof FunctionsHttpError) {
    const errorBody = await error.context.json();
    const msg = errorBody?.error || 'Erro ao processar';
    
    if (msg.includes('Créditos insuficientes') || msg.includes('créditos')) {
      setShowNoCreditsBanner(true);  // Exibir banner visual
    }
    toast.error(msg);
  } else {
    toast.error('Erro ao processar o certificado.');
  }
  creditBalanceRef.current?.refresh();
  return;
}
```

### Banner de créditos insuficientes

Exibido acima da area de upload quando `showNoCreditsBanner` e true:

```text
+--------------------------------------------------+
|  Seus creditos acabaram!                         |
|  Adquira mais creditos para continuar analisando |
|  [Comprar Creditos]                              |
+--------------------------------------------------+
```

O banner usa o componente Alert existente com icone, texto e o dialogo BuyCreditsDialog integrado.

## Resumo

| Arquivo | Mudanca |
|---------|---------|
| `Dashboard.tsx` | Importar FunctionsHttpError, corrigir parsing de erro, adicionar banner visual de creditos insuficientes |

