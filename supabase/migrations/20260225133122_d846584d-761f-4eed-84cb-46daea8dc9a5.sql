
-- Add blocked column
ALTER TABLE public.user_credits ADD COLUMN is_blocked boolean NOT NULL DEFAULT false;

-- Drop and recreate admin_list_users with new return type
DROP FUNCTION IF EXISTS public.admin_list_users();

CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE(user_id uuid, email text, credit_balance integer, created_at timestamp with time zone, is_blocked boolean)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    u.id AS user_id,
    u.email::text AS email,
    COALESCE(uc.balance, 0) AS credit_balance,
    u.created_at,
    COALESCE(uc.is_blocked, false) AS is_blocked
  FROM auth.users u
  LEFT JOIN public.user_credits uc ON uc.user_id = u.id
  ORDER BY u.created_at DESC
$$;

-- Function to toggle block
CREATE OR REPLACE FUNCTION public.admin_toggle_block_user(p_target_user_id uuid, p_admin_user_id uuid, p_blocked boolean)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(p_admin_user_id, 'admin') THEN
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

-- Function to check blocked status
CREATE OR REPLACE FUNCTION public.is_user_blocked(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_blocked FROM public.user_credits WHERE user_id = p_user_id),
    false
  )
$$;
