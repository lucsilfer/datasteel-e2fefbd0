import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FlaskConical, Upload, Brain, BarChart3, FileCheck, Coins, Check } from 'lucide-react';

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
      <header className="corporate-header sticky top-0 z-50">
        <div className="container max-w-6xl mx-auto flex items-center justify-between py-4 px-4">
          <div className="flex items-center gap-2.5">
            <FlaskConical className="h-5 w-5 text-primary" />
            <span className="text-base font-semibold tracking-tight text-foreground">DataSteel</span>
          </div>
          <Button size="sm" onClick={() => navigate('/auth')}>
            Entrar
          </Button>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-20">
        <div className="flex flex-col items-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground text-center">DataSteel</h1>

          <p className="text-xl md:text-2xl text-foreground text-center max-w-2xl mt-4 mb-4 font-medium">
            Análise química inteligente para reclassificação de chapas de aço
          </p>
          <p className="text-muted-foreground text-center max-w-xl mb-10">
            Transforme certificados de qualidade em insights técnicos para materiais de desvio NTU, NRU, NIR, QC
          </p>

          <Button size="lg" className="text-base px-8 py-6" onClick={() => navigate('/auth')}>
            Acessar Plataforma
          </Button>
        </div>

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

        {/* Pricing */}
        <section className="mt-20 w-full max-w-4xl">
          <h2 className="text-2xl font-bold text-foreground text-center mb-2">Planos de Créditos</h2>
          <p className="text-muted-foreground text-center mb-8">Cada análise consome 1 crédito. Comece com 3 créditos grátis!</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { credits: 10, price: 'R$ 9,90', perCredit: 'R$ 0,99' },
              { credits: 50, price: 'R$ 39,90', perCredit: 'R$ 0,80', popular: true },
              { credits: 100, price: 'R$ 69,90', perCredit: 'R$ 0,70' },
            ].map((plan) => (
              <div
                key={plan.credits}
                className={`corporate-card p-6 text-center relative ${plan.popular ? 'border-primary ring-1 ring-primary' : ''}`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground px-3 py-1 rounded-full">
                    Mais Popular
                  </span>
                )}
                <div className="flex justify-center mb-3">
                  <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center">
                    <Coins className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-foreground">{plan.credits}</h3>
                <p className="text-sm text-muted-foreground mb-3">créditos</p>
                <p className="text-xl font-bold text-foreground mb-1">{plan.price}</p>
                <p className="text-xs text-muted-foreground mb-4">{plan.perCredit}/crédito</p>
                <ul className="text-sm text-muted-foreground space-y-1.5 mb-5">
                  <li className="flex items-center gap-1.5 justify-center"><Check className="h-3.5 w-3.5 text-safe" /> Cartão ou Pix</li>
                  <li className="flex items-center gap-1.5 justify-center"><Check className="h-3.5 w-3.5 text-safe" /> Sem validade</li>
                </ul>
                <Button className="w-full" variant={plan.popular ? 'default' : 'outline'} onClick={() => navigate('/auth')}>
                  Começar
                </Button>
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
