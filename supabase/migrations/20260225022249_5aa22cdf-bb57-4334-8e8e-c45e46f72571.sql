
-- Enable realtime for user_credits
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_credits;

-- Create credits for any existing users that don't have them yet
INSERT INTO public.user_credits (user_id, balance)
SELECT id, 3 FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_credits)
ON CONFLICT (user_id) DO NOTHING;
