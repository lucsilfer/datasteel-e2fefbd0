
-- Create admin role system
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Only admins can read user_roles
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admin view: list all users with credits
CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE (
  user_id uuid,
  email text,
  credit_balance integer,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    u.id AS user_id,
    u.email::text AS email,
    COALESCE(uc.balance, 0) AS credit_balance,
    u.created_at
  FROM auth.users u
  LEFT JOIN public.user_credits uc ON uc.user_id = u.id
  ORDER BY u.created_at DESC
$$;

-- Admin function to add credits to a user
CREATE OR REPLACE FUNCTION public.admin_add_credits(p_target_user_id uuid, p_amount integer, p_admin_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_balance integer;
BEGIN
  -- Verify caller is admin
  IF NOT public.has_role(p_admin_user_id, 'admin') THEN
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
