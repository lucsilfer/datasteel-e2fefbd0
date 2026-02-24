import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FlaskConical, Upload, Brain, BarChart3, FileCheck } from 'lucide-react';

const features = [
  {
    icon: Upload,
    title: 'Upload de Certificados',
    description: 'Envie fotos ou PDFs de certificados de qualidade para análise instantânea.',
  },
  {
    icon: Brain,
    title: 'Análise por IA',
    description: 'Extração automática de composição química via inteligência artificial.',
  },
  {
    icon: BarChart3,
    title: 'Compatibilidade A36',
    description: 'Índice ponderado de similaridade com ASTM A36 baseado na composição química do material.',
  },
  {
    icon: FileCheck,
    title: 'Parecer Técnico',
    description: 'Avaliação de aplicabilidade utilizando ferramentas de inteligência artificial.',
  },
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />

      {/* Hero */}
      <main className="relative flex-1 flex flex-col items-center justify-center px-4 py-20">
        <div className="flex items-center gap-3 mb-6">
          <FlaskConical className="h-10 w-10 text-primary" />
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-gradient">DataSteel</h1>
        </div>

        <p className="text-xl md:text-2xl text-foreground/90 text-center max-w-2xl mb-4 font-medium">
          Análise química inteligente para reclassificação de chapas de aço
        </p>
        <p className="text-muted-foreground text-center max-w-xl mb-10">
          Transforme certificados de qualidade em insights técnicos para materiais de desvio (NTU, NRU, NIR, QC)
        </p>

        <Button size="lg" className="text-base px-8 py-6 animate-pulse-glow" onClick={() => navigate('/auth')}>
          Acessar Plataforma
        </Button>

        {/* Features */}
        <section className="mt-20 w-full max-w-4xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((f) => (
              <div key={f.title} className="glass-card p-6 flex gap-4 items-start">
                <div className="rounded-lg bg-primary/10 p-2.5 shrink-0">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative text-center py-6 text-xs text-muted-foreground border-t border-border/50">
        © {new Date().getFullYear()} DataSteel. Todos os direitos reservados.
      </footer>
    </div>
  );
};

export default Landing;
