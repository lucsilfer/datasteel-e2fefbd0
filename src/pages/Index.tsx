import React, { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AnalysisResult } from '@/types';
import { performTechnicalAnalysis } from '@/utils/calculations';
import ImageUpload from '@/components/ImageUpload';
import AnalysisCard from '@/components/AnalysisCard';
import { Separator } from '@/components/ui/separator';
import logo from '@/assets/logo-datasteel.png';

const Index = () => {
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileSelected = async (base64Data: string, mimeType: string) => {
    setIsLoading(true);
    setResults([]);

    try {
      const { data, error } = await supabase.functions.invoke('extract-certificate', {
        body: { base64Image: base64Data, mimeType },
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
      {/* Subtle background pattern */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 glass-card rounded-none border-x-0 border-t-0">
        <div className="container max-w-5xl mx-auto flex items-center justify-between py-4 px-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="DataSteel" className="h-6 w-auto object-contain" />
            <div>
              <h1 className="text-lg font-bold tracking-tight text-gradient">DataSteel</h1>
              <p className="text-xs text-muted-foreground">Análise inteligente de certificados</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="relative container max-w-5xl mx-auto px-4 py-8 space-y-8">
        <ImageUpload onFileSelected={handleFileSelected} isLoading={isLoading} />

        {results.length > 0 && (
          <div className="space-y-5 animate-fade-in">
            <div className="flex items-center gap-3">
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

export default Index;
