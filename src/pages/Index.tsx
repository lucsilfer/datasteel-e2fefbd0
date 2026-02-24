import React, { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AnalysisResult } from '@/types';
import { performTechnicalAnalysis } from '@/utils/calculations';
import ImageUpload from '@/components/ImageUpload';
import AnalysisCard from '@/components/AnalysisCard';
import { Separator } from '@/components/ui/separator';
import { Beaker } from 'lucide-react';

const Index = () => {
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageSelected = async (base64Image: string) => {
    setIsLoading(true);
    setResults([]);

    try {
      const { data, error } = await supabase.functions.invoke('extract-certificate', {
        body: { base64Image },
      });

      if (error) {
        console.error('Edge function error:', error);
        toast.error('Erro ao processar o certificado. Tente novamente.');
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
    } catch (err) {
      console.error('Error:', err);
      toast.error('Erro inesperado. Verifique sua conexão.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-sm">
        <div className="container max-w-5xl mx-auto flex items-center gap-3 py-4 px-4">
          <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
            <Beaker className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-foreground">DataSteel</h1>
            <p className="text-xs text-muted-foreground">Análise inteligente de certificados de aço</p>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container max-w-5xl mx-auto px-4 py-8 space-y-6">
        <ImageUpload onImageSelected={handleImageSelected} isLoading={isLoading} />

        {results.length > 0 && (
          <>
            <Separator />
            <div className="space-y-4">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Resultados da Análise — {results.length} corrida(s)
              </h2>
              {results.map((result, i) => (
                <AnalysisCard key={`${result.heatNumber}-${i}`} result={result} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Index;
