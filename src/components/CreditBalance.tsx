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
    let channel: ReturnType<typeof supabase.channel> | null = null;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await fetchBalance();
      channel = supabase
        .channel(`credit-balance-${user.id}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'user_credits',
          filter: `user_id=eq.${user.id}`,
        }, () => fetchBalance())
        .subscribe();
    })();
    return () => { if (channel) supabase.removeChannel(channel); };
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
