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
      {/* Header */}
      <header className="corporate-header text-white">
        <div className="container max-w-6xl mx-auto flex items-center justify-between py-4 px-4">
          <div className="flex items-center gap-2">
            <FlaskConical className="h-6 w-6" />
            <span className="text-lg font-bold tracking-tight">DataSteel</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-white/30 text-white hover:bg-white/10 hover:text-white"
            onClick={() => navigate('/auth')}
          >
            Entrar
          </Button>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-20">
        <div className="flex items-center gap-3 mb-6">
          <FlaskConical className="h-10 w-10 text-primary" />
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">DataSteel</h1>
        </div>

        <p className="text-xl md:text-2xl text-foreground text-center max-w-2xl mb-4 font-medium">
          Análise química inteligente para reclassificação de chapas de aço
        </p>
        <p className="text-muted-foreground text-center max-w-xl mb-10">
          Transforme certificados de qualidade em insights técnicos para materiais de desvio NTU, NRU, NIR, QC
        </p>

        <Button size="lg" className="text-base px-8 py-6" onClick={() => navigate('/auth')}>
          Acessar Plataforma
        </Button>

        {/* Features */}
        <section className="mt-20 w-full max-w-4xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {features.map((f) => (
              <div key={f.title} className="corporate-card p-6 flex gap-4 items-start hover:shadow-md transition-shadow">
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
      <footer className="text-center py-6 text-xs text-muted-foreground border-t border-border">
        © {new Date().getFullYear()} DataSteel. Todos os direitos reservados.
      </footer>
    </div>
  );
};

export default Landing;
