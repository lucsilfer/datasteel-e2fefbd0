import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Coins, CreditCard, Loader2, ShoppingCart } from 'lucide-react';

const PACKAGES = [
  { id: '10', credits: 10, price: 'R$ 9,90', pricePerCredit: 'R$ 0,99' },
  { id: '50', credits: 50, price: 'R$ 39,90', pricePerCredit: 'R$ 0,80', popular: true },
  { id: '100', credits: 100, price: 'R$ 69,90', pricePerCredit: 'R$ 0,70' },
];

interface BuyCreditsDialogProps {
  trigger?: React.ReactNode;
}

const BuyCreditsDialog = ({ trigger }: BuyCreditsDialogProps) => {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const handleBuy = async (packageId: string) => {
    setLoadingId(packageId);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { packageId },
      });

      if (error) {
        toast.error('Erro ao criar pagamento. Tente novamente.');
        return;
      }

      if (data?.init_point) {
        window.open(data.init_point, '_blank');
        setOpen(false);
      } else {
        toast.error('Erro ao gerar link de pagamento.');
      }
    } catch {
      toast.error('Erro inesperado. Verifique sua conexão.');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-1.5">
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">Comprar Créditos</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-warning" />
            Comprar Créditos
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Cada análise de certificado consome 1 crédito. Escolha seu pacote:
        </p>
        <div className="grid gap-3 mt-2">
          {PACKAGES.map((pkg) => (
            <button
              key={pkg.id}
              onClick={() => handleBuy(pkg.id)}
              disabled={loadingId !== null}
              className={`relative flex items-center justify-between p-4 rounded-lg border transition-all hover:shadow-md ${
                pkg.popular
                  ? 'border-primary bg-primary/5 hover:border-primary'
                  : 'border-border hover:border-primary/50'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {pkg.popular && (
                <span className="absolute -top-2.5 left-4 text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                  Popular
                </span>
              )}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Coins className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-foreground">{pkg.credits} créditos</p>
                  <p className="text-xs text-muted-foreground">{pkg.pricePerCredit}/crédito</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground">{pkg.price}</span>
                {loadingId === pkg.id ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                ) : (
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Pagamento seguro via Mercado Pago • Cartão ou Pix
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default BuyCreditsDialog;
