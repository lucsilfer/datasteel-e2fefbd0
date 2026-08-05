import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AnalysisResult } from '@/types';
import { performTechnicalAnalysis } from '@/utils/calculations';
import ImageUpload from '@/components/ImageUpload';
import AnalysisCard from '@/components/AnalysisCard';
import CreditBalance, { CreditBalanceRef } from '@/components/CreditBalance';
import BuyCreditsDialog from '@/components/BuyCreditsDialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { FlaskConical, LogOut, AlertTriangle, RotateCcw, Printer } from 'lucide-react';
import { printReport } from '@/components/PrintReport';

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showNoCreditsBanner, setShowNoCreditsBanner] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const creditBalanceRef = useRef<CreditBalanceRef>(null);

  useEffect(() => {
    const checkBlocked = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.rpc('is_user_blocked', { p_user_id: user.id });
        if (data === true) setIsBlocked(true);
      }
    };
    checkBlocked();
  }, []);

  useEffect(() => {
    const payment = searchParams.get('payment');
    if (payment === 'success') {
      toast.success('Pagamento aprovado! Seus créditos foram adicionados.');
      setShowNoCreditsBanner(false);

      creditBalanceRef.current?.refresh();
      const delays = [2000, 5000, 10000];
      const timers = delays.map(delay =>
        setTimeout(() => creditBalanceRef.current?.refresh(), delay)
      );

      return () => timers.forEach(clearTimeout);
    } else if (payment === 'failure') {
      toast.error('Pagamento não concluído. Tente novamente.');
    }
  }, [searchParams]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleFileSelected = async (base64Data: string, mimeType: string) => {
    setIsLoading(true);
    setResults([]);
    setShowNoCreditsBanner(false);

    try {
      const { data, error } = await supabase.functions.invoke('extract-certificate', {
        body: { base64Image: base64Data, mimeType },
      });

      if (error) {
        if (import.meta.env.DEV) console.error('Edge function error:', error);
        let errorMessage = 'Erro ao processar o certificado. Tente novamente.';

        if (error instanceof FunctionsHttpError) {
          try {
            const errorBody = await error.context.json();
            if (errorBody?.error) {
              errorMessage = errorBody.error;
            }
          } catch {
            // ignore parse errors
          }
        }

        if (errorMessage.toLowerCase().includes('crédito')) {
          setShowNoCreditsBanner(true);
        }

        toast.error(errorMessage);
        creditBalanceRef.current?.refresh();
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      const heats = data?.heats;
      if (!heats || heats.length === 0) {
        toast.warning('Nenhuma corrida encontrada no certificado.');
        return;
      }

      const analyzed = heats.map((heat: any) => performTechnicalAnalysis(heat));
      setResults(analyzed);
      toast.success(`${analyzed.length} corrida(s) analisada(s) com sucesso!`);
      creditBalanceRef.current?.refresh();
    } catch (err) {
      console.error('Error:', err);
      toast.error('Erro inesperado. Verifique sua conexão.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="corporate-header text-white sticky top-0 z-50">
        <div className="container max-w-5xl mx-auto flex items-center justify-between py-4 px-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-md bg-white/10 flex items-center justify-center shrink-0">
              <FlaskConical className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-semibold tracking-[0.02em]">DataSteel</h1>
              <p className="text-xs text-white/60">Análise inteligente de certificados</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CreditBalance ref={creditBalanceRef} />
            <BuyCreditsDialog />
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 hover:text-white" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-8 space-y-8">
        {isBlocked && (
          <Alert variant="destructive" className="border-destructive/30 bg-destructive/5">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle className="text-base font-semibold">Conta bloqueada</AlertTitle>
            <AlertDescription>
              Sua conta foi bloqueada pelo administrador. Entre em contato para mais informações.
            </AlertDescription>
          </Alert>
        )}
        {!isBlocked && showNoCreditsBanner && (
          <Alert variant="destructive" className="border-destructive/30 bg-destructive/5">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle className="text-base font-semibold">Seus créditos acabaram!</AlertTitle>
            <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-3 mt-1">
              <span>Adquira mais créditos para continuar analisando certificados.</span>
              <BuyCreditsDialog
                trigger={
                  <Button size="sm" variant="default" className="w-fit">
                    Comprar Créditos
                  </Button>
                }
              />
            </AlertDescription>
          </Alert>
        )}

        {results.length === 0 && !isBlocked && (
          <ImageUpload onFileSelected={handleFileSelected} onFileCleared={() => setResults([])} isLoading={isLoading} />
        )}

        {results.length > 0 && (
          <div className="space-y-5 animate-fade-in">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setResults([]); setShowNoCreditsBanner(false); }}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Nova Análise
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => printReport(results)}
                className="gap-2"
              >
                <Printer className="h-4 w-4" />
                Imprimir Relatório
              </Button>
              <Separator className="flex-1" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                {results.length} corrida(s) analisada(s)
              </span>
              <Separator className="flex-1" />
            </div>
            {results.map((result, i) => (
              <AnalysisCard key={`${result.heatNumber}-${i}`} result={result} index={i} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
