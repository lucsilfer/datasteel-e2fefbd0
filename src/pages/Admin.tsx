import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { FlaskConical, ArrowLeft, Users, Coins, Plus, Search, Loader2, ShieldBan, ShieldCheck } from 'lucide-react';

interface UserRow {
  user_id: string;
  email: string;
  credit_balance: number;
  created_at: string;
  is_blocked: boolean;
}

const Admin = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [creditAmount, setCreditAmount] = useState('');
  const [addingCredits, setAddingCredits] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [togglingBlock, setTogglingBlock] = useState<string | null>(null);

  useEffect(() => {
    checkAdminAndLoad();
  }, []);

  const checkAdminAndLoad = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (!roleData) {
      setIsAdmin(false);
      return;
    }

    setIsAdmin(true);
    await fetchUsers();
  };

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc('admin_list_users');

    if (error) {
      toast.error('Erro ao carregar usuários.');
      console.error(error);
    } else {
      setUsers((data as UserRow[]) || []);
    }
    setLoading(false);
  };

  const handleAddCredits = async () => {
    if (!selectedUser || !creditAmount) return;
    const amount = parseInt(creditAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Informe um valor válido maior que 0.');
      return;
    }

    setAddingCredits(true);

    const { data, error } = await supabase.rpc('admin_add_credits', {
      p_target_user_id: selectedUser.user_id,
      p_amount: amount,
    });

    if (error) {
      toast.error('Erro ao adicionar créditos: ' + error.message);
    } else {
      toast.success(`${amount} crédito(s) adicionado(s) para ${selectedUser.email}. Novo saldo: ${data}`);
      setDialogOpen(false);
      setCreditAmount('');
      setSelectedUser(null);
      await fetchUsers();
    }
    setAddingCredits(false);
  };

  const handleToggleBlock = async (user: UserRow) => {
    setTogglingBlock(user.user_id);
    const newBlocked = !user.is_blocked;

    const { error } = await supabase.rpc('admin_toggle_block_user', {
      p_target_user_id: user.user_id,
      p_blocked: newBlocked,
    });

    if (error) {
      toast.error('Erro ao alterar status: ' + error.message);
    } else {
      toast.success(newBlocked ? `${user.email} foi bloqueado.` : `${user.email} foi desbloqueado.`);
      await fetchUsers();
    }
    setTogglingBlock(null);
  };

  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <p className="text-lg font-semibold text-destructive">Acesso negado</p>
            <p className="text-muted-foreground">Você não tem permissão para acessar esta página.</p>
            <Button onClick={() => navigate('/dashboard')}>Voltar ao Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="corporate-header sticky top-0 z-50">
        <div className="container max-w-6xl mx-auto flex items-center justify-between py-4 px-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <FlaskConical className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-base font-semibold tracking-tight text-foreground">DataSteel Admin</h1>
              <p className="text-xs text-muted-foreground">Painel Administrativo</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{users.length}</p>
                <p className="text-sm text-muted-foreground">Usuários cadastrados</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center">
                <Coins className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {users.reduce((sum, u) => sum + u.credit_balance, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total de créditos em circulação</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Usuários</span>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por email..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-center">Créditos</TableHead>
                      <TableHead>Cadastro</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map(user => (
                      <TableRow key={user.user_id}>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell className="text-center">
                          {user.is_blocked ? (
                            <span className="inline-flex items-center gap-1 text-destructive text-xs font-semibold">
                              <ShieldBan className="h-3.5 w-3.5" />
                              Bloqueado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-safe text-xs font-semibold">
                              <ShieldCheck className="h-3.5 w-3.5" />
                              Ativo
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center gap-1">
                            <Coins className="h-3.5 w-3.5 text-warning" />
                            {user.credit_balance}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(user.created_at).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          {user.is_blocked ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleToggleBlock(user)}
                              disabled={togglingBlock === user.user_id}
                            >
                              {togglingBlock === user.user_id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                              ) : (
                                <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                              )}
                              Desbloquear
                            </Button>
                          ) : (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="destructive" disabled={togglingBlock === user.user_id}>
                                  {togglingBlock === user.user_id ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                                  ) : (
                                    <ShieldBan className="h-3.5 w-3.5 mr-1" />
                                  )}
                                  Bloquear
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Bloquear usuário?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    <span className="font-medium text-foreground">{user.email}</span> não vai mais conseguir analisar certificados até ser desbloqueado.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleToggleBlock(user)}>Bloquear</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                          <Dialog open={dialogOpen && selectedUser?.user_id === user.user_id} onOpenChange={(open) => {
                            setDialogOpen(open);
                            if (!open) { setSelectedUser(null); setCreditAmount(''); }
                          }}>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => { setSelectedUser(user); setDialogOpen(true); }}
                              >
                                <Plus className="h-3.5 w-3.5 mr-1" />
                                Créditos
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-sm">
                              <DialogHeader>
                                <DialogTitle>Adicionar Créditos</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                  Usuário: <span className="font-medium text-foreground">{user.email}</span>
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Saldo atual: <span className="font-semibold text-foreground">{user.credit_balance}</span>
                                </p>
                                <Input
                                  type="number"
                                  min={1}
                                  placeholder="Quantidade de créditos"
                                  value={creditAmount}
                                  onChange={e => setCreditAmount(e.target.value)}
                                />
                                <Button
                                  className="w-full"
                                  onClick={handleAddCredits}
                                  disabled={addingCredits || !creditAmount}
                                >
                                  {addingCredits ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  ) : (
                                    <Plus className="h-4 w-4 mr-2" />
                                  )}
                                  Adicionar
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredUsers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          Nenhum usuário encontrado.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Admin;
