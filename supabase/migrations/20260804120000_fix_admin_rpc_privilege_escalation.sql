
-- SECURITY FIX: admin RPCs must authorize the actual authenticated caller
-- (auth.uid()), never a client-supplied id. Previously admin_add_credits
-- and admin_toggle_block_user took p_admin_user_id as an argument and
-- checked has_role() on THAT value — but the caller controls every
-- argument of an RPC call. Any authenticated user could call these
-- functions directly (bypassing the UI) with p_admin_user_id set to a
-- real admin's id while p_target_user_id pointed at their own account,
-- passing the "is admin" check while acting as themselves — granting
-- themselves unlimited credits or unblocking their own account.
--
-- admin_list_users() had no authorization check at all and leaked every
-- user's email, credit balance and blocked status to any authenticated
-- (or even anonymous, if PostgREST grants allow it) caller.
--
-- is_user_blocked(p_user_id) let any authenticated user probe whether an
-- arbitrary account (not just their own) was blocked.

-- 1. admin_list_users: add the missing authorization check.
DROP FUNCTION IF EXISTS public.admin_list_users();

CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE(user_id uuid, email text, credit_balance integer, created_at timestamp with time zone, is_blocked boolean)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: admin role required';
  END IF;

  RETURN QUERY
  SELECT
    u.id AS user_id,
    u.email::text AS email,
    COALESCE(uc.balance, 0) AS credit_balance,
    u.created_at,
    COALESCE(uc.is_blocked, false) AS is_blocked
  FROM auth.users u
  LEFT JOIN public.user_credits uc ON uc.user_id = u.id
  ORDER BY u.created_at DESC;
END;
$$;

-- 2. admin_add_credits: drop the spoofable p_admin_user_id argument,
--    authorize against auth.uid() instead.
DROP FUNCTION IF EXISTS public.admin_add_credits(uuid, integer, uuid);

CREATE OR REPLACE FUNCTION public.admin_add_credits(p_target_user_id uuid, p_amount integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_balance integer;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: admin role required';
  END IF;

  INSERT INTO public.user_credits (user_id, balance)
  VALUES (p_target_user_id, p_amount)
  ON CONFLICT (user_id)
  DO UPDATE SET balance = user_credits.balance + p_amount;

  SELECT balance INTO new_balance FROM public.user_credits WHERE user_id = p_target_user_id;

  INSERT INTO public.credit_transactions (user_id, amount, type, description)
  VALUES (p_target_user_id, p_amount, 'admin', 'Créditos adicionados pelo administrador');

  RETURN new_balance;
END;
$$;

-- 3. admin_toggle_block_user: same fix.
DROP FUNCTION IF EXISTS public.admin_toggle_block_user(uuid, uuid, boolean);

CREATE OR REPLACE FUNCTION public.admin_toggle_block_user(p_target_user_id uuid, p_blocked boolean)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: admin role required';
  END IF;

  UPDATE public.user_credits
  SET is_blocked = p_blocked
  WHERE user_id = p_target_user_id;

  IF NOT FOUND THEN
    INSERT INTO public.user_credits (user_id, balance, is_blocked)
    VALUES (p_target_user_id, 0, p_blocked);
  END IF;

  RETURN p_blocked;
END;
$$;

-- 4. is_user_blocked: only ever used for a self-check — drop the
--    parameter entirely so it can only report the caller's own status.
DROP FUNCTION IF EXISTS public.is_user_blocked(uuid);

CREATE OR REPLACE FUNCTION public.is_user_blocked()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_blocked FROM public.user_credits WHERE user_id = auth.uid()),
    false
  )
$$;
