
-- 1. Update debit_credit to check is_blocked
CREATE OR REPLACE FUNCTION public.debit_credit(p_user_id uuid, p_description text DEFAULT 'Análise de certificado'::text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_balance INTEGER;
  user_blocked BOOLEAN;
BEGIN
  SELECT balance, is_blocked INTO current_balance, user_blocked
  FROM public.user_credits
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF user_blocked = true THEN
    RETURN -2;
  END IF;

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
$function$;

-- 2. Remove the dangerous self-update policy on user_credits
DROP POLICY IF EXISTS "Users can update own credits" ON public.user_credits;

-- 3. Explicit deny policies on user_credits
CREATE POLICY "Deny direct insert on user_credits"
  ON public.user_credits FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Deny direct update on user_credits"
  ON public.user_credits FOR UPDATE
  USING (false);

CREATE POLICY "Deny direct delete on user_credits"
  ON public.user_credits FOR DELETE
  USING (false);

-- 4. Explicit deny policies on credit_transactions
CREATE POLICY "Deny direct insert on credit_transactions"
  ON public.credit_transactions FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Deny direct update on credit_transactions"
  ON public.credit_transactions FOR UPDATE
  USING (false);

CREATE POLICY "Deny direct delete on credit_transactions"
  ON public.credit_transactions FOR DELETE
  USING (false);

-- 5. Explicit deny policies on user_roles (prevent privilege escalation via direct writes)
CREATE POLICY "Deny direct insert on user_roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Deny direct update on user_roles"
  ON public.user_roles FOR UPDATE
  USING (false);

CREATE POLICY "Deny direct delete on user_roles"
  ON public.user_roles FOR DELETE
  USING (false);
