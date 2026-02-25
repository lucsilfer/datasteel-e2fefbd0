

# Integração Mercado Pago com Sistema de Créditos

## Visao Geral

Implementar um sistema onde usuarios compram pacotes de creditos via Mercado Pago (cartao ou Pix) e gastam 1 credito por analise de certificado.

## Fluxo do Usuario

```text
+-------------------+     +------------------+     +-------------------+
| Dashboard         | --> | Comprar Creditos  | --> | Mercado Pago      |
| (mostra saldo)    |     | (escolhe pacote)  |     | (cartao ou Pix)   |
+-------------------+     +------------------+     +-------------------+
                                                           |
                                                           v
+-------------------+     +------------------+     +-------------------+
| Creditos somados  | <-- | Webhook confirma  | <-- | Pagamento aprovado|
| ao saldo          |     | pagamento         |     |                   |
+-------------------+     +------------------+     +-------------------+
```

## Etapas de Implementacao

### 1. Configurar Secret do Mercado Pago
- Solicitar ao usuario o **Access Token** do Mercado Pago (encontrado em https://www.mercadopago.com.br/developers/panel/app)
- Armazenar como secret `MERCADO_PAGO_ACCESS_TOKEN`

### 2. Criar Tabelas no Banco de Dados

**Tabela `user_credits`** - Saldo de creditos por usuario
- `id` (uuid, PK)
- `user_id` (uuid, referencia auth.users, unique)
- `balance` (integer, default 3 -- creditos iniciais gratuitos)
- `created_at`, `updated_at`

**Tabela `credit_transactions`** - Historico de transacoes
- `id` (uuid, PK)
- `user_id` (uuid)
- `amount` (integer, positivo = compra, negativo = uso)
- `type` (text: 'purchase', 'usage', 'bonus')
- `description` (text)
- `mp_payment_id` (text, nullable -- ID do Mercado Pago)
- `created_at`

**Trigger**: Criar registro automatico em `user_credits` quando usuario se cadastra (com 3 creditos de bonus).

**RLS Policies**: Usuarios so veem seus proprios dados.

### 3. Edge Function: `create-payment`
- Recebe o pacote escolhido (ex: 10, 50, 100 creditos)
- Cria uma "preference" no Mercado Pago via API REST
- Retorna o link de pagamento (suporta cartao e Pix automaticamente)
- Autenticada (verifica JWT do usuario)

### 4. Edge Function: `mp-webhook`
- Endpoint publico que recebe notificacoes do Mercado Pago
- Quando pagamento e aprovado (`status: approved`):
  - Consulta detalhes do pagamento na API do Mercado Pago
  - Credita o saldo do usuario na tabela `user_credits`
  - Registra a transacao em `credit_transactions`

### 5. Modificar `extract-certificate`
- Antes de processar, verificar se o usuario tem creditos
- Se sim: processar e debitar 1 credito
- Se nao: retornar erro 402 com mensagem amigavel

### 6. Interface do Usuario (Dashboard)
- **Saldo de creditos** visivel no header do Dashboard
- **Botao "Comprar Creditos"** que abre um dialog/modal com:
  - Pacotes disponiveis (ex: 10 por R$9,90 / 50 por R$39,90 / 100 por R$69,90)
  - Ao clicar, redireciona para checkout do Mercado Pago
- **Mensagem** quando creditos acabam, com link para comprar mais
- **Pagina de retorno** apos pagamento (sucesso/erro)

### 7. Pagina de Pricing na Landing
- Adicionar secao de precos na Landing Page com os pacotes disponiveis

## Detalhes Tecnicos

### API Mercado Pago - Criar Preference
```text
POST https://api.mercadopago.com/checkout/preferences
Authorization: Bearer ACCESS_TOKEN

{
  "items": [{
    "title": "10 Creditos DataSteel",
    "quantity": 1,
    "unit_price": 9.90,
    "currency_id": "BRL"
  }],
  "payment_methods": {
    "excluded_payment_types": [],
    "installments": 1
  },
  "back_urls": {
    "success": "https://datasteel.lovable.app/dashboard?payment=success",
    "failure": "https://datasteel.lovable.app/dashboard?payment=failure"
  },
  "notification_url": "https://<project>.supabase.co/functions/v1/mp-webhook",
  "external_reference": "user_id:credits_amount"
}
```

### Webhook - Validacao
O webhook recebe `{ type: "payment", data: { id: "..." } }`. A edge function consulta `GET https://api.mercadopago.com/v1/payments/{id}` para verificar o status antes de creditar.

### Arquivos criados/modificados
1. **Criar** `supabase/functions/create-payment/index.ts`
2. **Criar** `supabase/functions/mp-webhook/index.ts`
3. **Modificar** `supabase/functions/extract-certificate/index.ts` (verificar creditos)
4. **Criar** `src/components/CreditBalance.tsx` (exibir saldo)
5. **Criar** `src/components/BuyCreditsDialog.tsx` (modal de compra)
6. **Modificar** `src/pages/Dashboard.tsx` (integrar saldo e botao de compra)
7. **Modificar** `src/pages/Landing.tsx` (secao de precos)
8. **Migracoes SQL** para tabelas e RLS

