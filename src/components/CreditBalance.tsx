import { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Coins } from 'lucide-react';

export interface CreditBalanceRef {
  refresh: () => Promise<void>;
}

const CreditBalance = forwardRef<CreditBalanceRef>((_, ref) => {
  const [balance, setBalance] = useState<number | null>(null);

  const fetchBalance = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('user_credits')
      .select('balance')
      .eq('user_id', user.id)
      .single();

    setBalance(data?.balance ?? 0);
  };

  useImperativeHandle(ref, () => ({
    refresh: fetchBalance,
  }));

  useEffect(() => {
    fetchBalance();

    const channel = supabase
      .channel('credit-balance')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_credits',
      }, () => fetchBalance())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  if (balance === null) return null;

  return (
    <div className="flex items-center gap-1.5 text-sm">
      <Coins className="h-4 w-4 text-warning" />
      <span className="font-semibold">{balance}</span>
    </div>
  );
});

CreditBalance.displayName = 'CreditBalance';

export default CreditBalance;
