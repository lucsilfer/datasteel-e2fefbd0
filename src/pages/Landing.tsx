import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FlaskConical, Upload, Brain, BarChart3, FileCheck, Coins, Check, ArrowRight, Zap } from 'lucide-react';

const features = [
  {
    icon: Upload,
    title: 'Envie e pronto',
    description: 'Foto ou PDF do certificado. Sem planilha, sem digitar composição química na mão.',
  },
  {
    icon: Brain,
    title: 'IA que lê o certificado por você',
    description: 'Composição química extraída automaticamente, sem erro de leitura ou de digitação.',
  },
  {
    icon: BarChart3,
    title: 'Saiba na hora se o material serve',
    description: 'Índice de compatibilidade com ASTM A36 calculado na hora — decisão de compra em segundos, não em horas.',
  },
  {
    icon: FileCheck,
    title: 'Parecer técnico, não achismo',
    description: 'Recomendação de dobra, solda e usinagem gerada por IA, sem depender da agenda de um engenheiro.',
  },
];

const steps = [
  { number: '1', title: 'Envie o certificado', description: 'Foto ou PDF, direto do celular ou computador.' },
  { number: '2', title: 'A IA analisa', description: 'Composição, CE e compatibilidade calculados em segundos.' },
  { number: '3', title: 'Você decide', description: 'Compra, vende ou recusa o lote com parecer técnico em mãos.' },
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
      <main className="flex-1 flex flex-col items-center px-4 py-20">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 mb-6">
            <FlaskConical className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold text-muted-foreground tracking-tight">DataSteel</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground text-center max-w-3xl leading-[1.1]">
            Pare de perder dinheiro classificando aço no olho
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground text-center max-w-2xl mt-6 mb-8">
            Envie o certificado de material de desvio (NTU, NRU, NIR, QC) e receba composição química, compatibilidade com ASTM A36 e parecer técnico — em segundos, não em horas.
          </p>

          <div className="flex flex-col items-center gap-4">
            <Button size="lg" className="text-base px-8 py-6 gap-2" onClick={() => navigate('/auth')}>
              Analisar meu primeiro certificado grátis
              <ArrowRight className="h-4 w-4" />
            </Button>
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-safe" /> 3 análises grátis</span>
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-safe" /> Sem cartão de crédito</span>
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-safe" /> Resultado em segundos</span>
            </div>
          </div>
        </div>

        {/* How it works */}
        <section className="mt-24 w-full max-w-4xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-5">
            {steps.map((step, i) => (
              <div key={step.number} className="flex sm:flex-col items-start sm:items-center gap-4 sm:gap-3 sm:text-center relative">
                <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
                  {step.number}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{step.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                </div>
                {i < steps.length - 1 && (
                  <ArrowRight className="hidden sm:block absolute top-5 -right-7 h-4 w-4 text-muted-foreground/40" />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="mt-24 w-full max-w-4xl">
          <h2 className="text-2xl font-bold text-foreground text-center mb-2">Feito para quem decide sob pressão</h2>
          <p className="text-muted-foreground text-center mb-10 max-w-xl mx-auto">
            Cada minuto parado com um lote de desvio é dinheiro parado no pátio. O DataSteel tira a decisão do achismo.
          </p>
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
        <section className="mt-24 w-full max-w-4xl">
          <h2 className="text-2xl font-bold text-foreground text-center mb-2">Sem mensalidade. Pague só o que analisar</h2>
          <p className="text-muted-foreground text-center mb-8">Cada análise consome 1 crédito. Comece com 3 créditos grátis — sem cartão.</p>
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

        {/* Final CTA */}
        <section className="mt-24 w-full max-w-3xl">
          <div className="corporate-card p-10 text-center bg-primary/[0.03] border-primary/20">
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Zap className="h-6 w-6 text-primary" />
              </div>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Seu próximo lote de desvio não precisa esperar
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Crie sua conta grátis e analise seu primeiro certificado agora mesmo. Sem cartão, sem compromisso.
            </p>
            <Button size="lg" className="text-base px-8 py-6 gap-2" onClick={() => navigate('/auth')}>
              Criar conta grátis
              <ArrowRight className="h-4 w-4" />
            </Button>
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
