import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FlaskConical, Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

type Mode = 'login' | 'signup' | 'forgot' | 'recovery';

const Auth = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setMode('recovery');
        return;
      }
      if (session && mode !== 'recovery') navigate('/dashboard', { replace: true });
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && mode !== 'recovery') navigate('/dashboard', { replace: true });
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast.success('Conta criada com sucesso!');
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth`,
        });
        if (error) throw error;
        toast.success('Enviamos um link para redefinir sua senha. Verifique seu e-mail.');
        setMode('login');
      } else if (mode === 'recovery') {
        if (password.length < 8) {
          toast.error('A nova senha deve ter pelo menos 8 caracteres.');
          setLoading(false);
          return;
        }
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        toast.success('Senha atualizada com sucesso!');
        navigate('/dashboard', { replace: true });
      }
    } catch (err: any) {
      toast.error(err.message || 'Erro na autenticação');
    } finally {
      setLoading(false);
    }
  };

  const titles: Record<Mode, string> = {
    login: 'Entrar na plataforma',
    signup: 'Criar conta',
    forgot: 'Recuperar senha',
    recovery: 'Defina uma nova senha',
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="corporate-header">
        <div className="container max-w-6xl mx-auto flex items-center py-4 px-4">
          <div className="flex items-center gap-2.5">
            <FlaskConical className="h-5 w-5 text-primary" />
            <span className="text-base font-semibold tracking-tight text-foreground">DataSteel</span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="corporate-card p-8 w-full max-w-md space-y-6">
          <div className="flex flex-col items-center gap-2 mb-2">
            <div className="h-11 w-11 rounded-md bg-primary/10 flex items-center justify-center">
              <FlaskConical className="h-5 w-5 text-primary" />
            </div>
            <span className="text-lg font-bold text-foreground tracking-tight">DataSteel</span>
          </div>

          <h2 className="text-center text-lg font-semibold text-foreground">{titles[mode]}</h2>
          {mode === 'forgot' && (
            <p className="text-center text-sm text-muted-foreground -mt-4">
              Informe seu e-mail e enviaremos um link para redefinir sua senha.
            </p>
          )}
          {mode === 'recovery' && (
            <p className="text-center text-sm text-muted-foreground -mt-4">
              Escolha uma nova senha para sua conta.
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode !== 'recovery' && (
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                />
              </div>
            )}

            {mode !== 'forgot' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">{mode === 'recovery' ? 'Nova senha' : 'Senha'}</Label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      className="text-xs text-primary hover:underline"
                      onClick={() => setMode('forgot')}
                    >
                      Esqueci minha senha
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={mode === 'recovery' ? 8 : 6}
                    autoComplete={mode === 'signup' || mode === 'recovery' ? 'new-password' : 'current-password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-0 top-0 h-full px-3 flex items-center text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="sr-only">{showPassword ? 'Ocultar senha' : 'Mostrar senha'}</span>
                  </button>
                </div>
                {mode === 'signup' && (
                  <p className="text-xs text-muted-foreground">Mínimo de 6 caracteres.</p>
                )}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'login' && 'Entrar'}
              {mode === 'signup' && 'Cadastrar'}
              {mode === 'forgot' && 'Enviar link de recuperação'}
              {mode === 'recovery' && 'Salvar nova senha'}
            </Button>
          </form>

          {mode === 'login' && (
            <p className="text-center text-sm text-muted-foreground">
              Não tem conta?{' '}
              <button type="button" className="text-primary hover:underline font-medium" onClick={() => setMode('signup')}>
                Cadastre-se
              </button>
            </p>
          )}
          {mode === 'signup' && (
            <p className="text-center text-sm text-muted-foreground">
              Já tem conta?{' '}
              <button type="button" className="text-primary hover:underline font-medium" onClick={() => setMode('login')}>
                Faça login
              </button>
            </p>
          )}
          {mode === 'forgot' && (
            <p className="text-center text-sm text-muted-foreground">
              <button type="button" className="text-primary hover:underline font-medium" onClick={() => setMode('login')}>
                Voltar para o login
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
