
-- Tabela de saldo de créditos
CREATE TABLE public.user_credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  balance INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own credits"
  ON public.user_credits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own credits"
  ON public.user_credits FOR UPDATE
  USING (auth.uid() = user_id);

-- Tabela de transações de créditos
CREATE TABLE public.credit_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'usage', 'bonus')),
  description TEXT,
  mp_payment_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON public.credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_user_credits_updated_at
  BEFORE UPDATE ON public.user_credits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para criar créditos automáticos ao cadastrar
CREATE OR REPLACE FUNCTION public.handle_new_user_credits()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_credits (user_id, balance)
  VALUES (NEW.id, 3);

  INSERT INTO public.credit_transactions (user_id, amount, type, description)
  VALUES (NEW.id, 3, 'bonus', 'Créditos de boas-vindas');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created_credits
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_credits();

-- Função para debitar créditos (usada pelas edge functions via service role)
CREATE OR REPLACE FUNCTION public.debit_credit(p_user_id UUID, p_description TEXT DEFAULT 'Análise de certificado')
RETURNS INTEGER AS $$
DECLARE
  current_balance INTEGER;
BEGIN
  SELECT balance INTO current_balance
  FROM public.user_credits
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF current_balance IS NULL OR current_balance < 1 THEN
    RETURN -1;
  END IF;

  UPDATE public.user_credits
  SET balance = balance - 1
  WHERE user_id = p_user_id;

  INSERT INTO public.credit_transactions (user_id, amount, type, description)
  VALUES (p_user_id, -1, 'usage', p_description);

  RETURN current_balance - 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Função para creditar (usada pelo webhook via service role)
CREATE OR REPLACE FUNCTION public.credit_user(p_user_id UUID, p_amount INTEGER, p_mp_payment_id TEXT)
RETURNS INTEGER AS $$
DECLARE
  new_balance INTEGER;
BEGIN
  -- Verificar se já foi creditado (idempotência)
  IF EXISTS (SELECT 1 FROM public.credit_transactions WHERE mp_payment_id = p_mp_payment_id) THEN
    SELECT balance INTO new_balance FROM public.user_credits WHERE user_id = p_user_id;
    RETURN COALESCE(new_balance, 0);
  END IF;

  INSERT INTO public.user_credits (user_id, balance)
  VALUES (p_user_id, p_amount)
  ON CONFLICT (user_id)
  DO UPDATE SET balance = user_credits.balance + p_amount;

  SELECT balance INTO new_balance FROM public.user_credits WHERE user_id = p_user_id;

  INSERT INTO public.credit_transactions (user_id, amount, type, description, mp_payment_id)
  VALUES (p_user_id, p_amount, 'purchase', p_amount || ' créditos via Mercado Pago', p_mp_payment_id);

  RETURN new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
