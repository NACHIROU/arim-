import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User } from '@/types';
import { 
  Loader2, Trash2, UserX, UserCheck, Users, 
  Search, Filter, Eye, Shield, MessageSquare 
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { ShoppingBasket } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AdminDashboardPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [orderStats, setOrderStats] = useState({ total: 0, pending: 0 });
  const [suggestionStats, setSuggestionStats] = useState({ total: 0, new: 0 });

  const { toast } = useToast();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const fetchData = useCallback(async () => {
    if (!token) { navigate('/login'); return; }

    const userParams = new URLSearchParams();
    if (roleFilter !== "all") userParams.append('role', roleFilter);
    if (statusFilter !== "all") userParams.append('status', statusFilter);
    if (searchTerm.trim().length >= 2) userParams.append('search', searchTerm);
    
    const usersUrl = `http://localhost:8000/admin/users?${userParams.toString()}`;
    const statsUrl = "http://localhost:8000/admin/suggestions/stats";
    const ordersStatsUrl = "http://localhost:8000/admin/orders/stats";

    try {
      const [usersResponse, statsResponse, ordersStatsResponse] = await Promise.all([
        fetch(usersUrl, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(statsUrl, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(ordersStatsUrl, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (!usersResponse.ok) throw new Error("Erreur de chargement des utilisateurs.");
      if (!statsResponse.ok) throw new Error("Erreur de chargement des statistiques.");
      if (!ordersStatsResponse.ok) throw new Error("Erreur de chargement des statistiques des commandes.");
      setOrderStats(await ordersStatsResponse.json());
      setUsers(await usersResponse.json());
      setSuggestionStats(await statsResponse.json());

    } catch (error) {
      console.error("Erreur de chargement du dashboard:", error);
      toast({ title: "Erreur", description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [token, navigate, toast, roleFilter, statusFilter, searchTerm]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      setIsLoading(true);
      fetchData();
    }, 300);
    return () => clearTimeout(debounce);
  }, [fetchData, roleFilter, statusFilter, searchTerm]);

  const handleUpdateStatus = async (userId: string, isActive: boolean) => {
    const action = isActive ? "réactiver" : "suspendre";
    if (!window.confirm(`Êtes-vous sûr de vouloir ${action} cet utilisateur ?`)) return;
    
    try {
      const response = await fetch(`http://localhost:8000/admin/users/${userId}/status?is_active=${isActive}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "L'opération a échoué.");
      }
      toast({ title: "Succès", description: `Utilisateur ${action} avec succès.` });
      fetchData();
    } catch (error) {
      toast({ title: "Erreur", description: (error as Error).message, variant: "destructive" });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("ACTION DÉFINITIVE : Voulez-vous vraiment supprimer cet utilisateur ?")) return;
    try {
      const response = await fetch(`http://localhost:8000/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Erreur lors de la suppression.");
      }
      toast({ title: "Succès", description: "Utilisateur supprimé avec succès." });
      fetchData();
    } catch (error) {
      toast({ title: "Erreur", description: (error as Error).message, variant: "destructive" });
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'merchant': return 'secondary';
      default: return 'outline';
    }
  };

    const stats = {
    total: users.length,
    active: users.filter(u => u.is_active).length,
    suspended: users.filter(u => !u.is_active).length,
    clients: users.filter(u => u.role === 'client').length,
    merchants: users.filter(u => u.role === 'merchant').length,
    admins: users.filter(u => u.role === 'admin').length,
  };

  if (isLoading && users.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard Administrateur</h1>
            <p className="text-muted-foreground">Supervision et modération de la plateforme.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
            {/* Carte Total Utilisateurs */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Utilisateurs</p>
            </CardContent>
          </Card>

          {/* Carte Utilisateurs Actifs */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">Actifs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <p className="text-xs text-muted-foreground">{stats.total > 0 ? `${Math.round((stats.active / stats.total) * 100)}%` : '0%'} du total</p>
            </CardContent>
          </Card>

          {/* Carte Utilisateurs Suspendus */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-600">Suspendus</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.suspended}</div>
               <p className="text-xs text-muted-foreground">{stats.total > 0 ? `${Math.round((stats.suspended / stats.total) * 100)}%` : '0%'} du total</p>
            </CardContent>
          </Card>

          {/* Carte Clients */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-600">Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.clients}</div>
              <p className="text-xs text-muted-foreground">Utilisateurs finaux</p>
            </CardContent>
          </Card>

          {/* Carte Marchands */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-600">Marchands</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.merchants}</div>
              <p className="text-xs text-muted-foreground">Vendeurs</p>
            </CardContent>
          </Card>

          {/* Carte Admins */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-600">Admins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.admins}</div>
              <p className="text-xs text-muted-foreground">Administrateurs</p>
            </CardContent>
          </Card>
          <Link to="/admin/suggestions">
            <Card className="hover:shadow-lg hover:border-primary transition-all h-full">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-cyan-600">Messages</CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-cyan-600">{suggestionStats.new}</div>
                <div className="flex items-center text-xs text-muted-foreground"><MessageSquare className="h-3 w-3 mr-1" />{suggestionStats.total} au total</div>
              </CardContent>
            </Card>
          </Link>

      <Link to="/admin/orders" className="lg:col-span-2">
        <Card className="hover:shadow-lg hover:border-primary transition-all h-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-indigo-600">Commandes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">{orderStats.pending}</div>
            <p className="text-xs text-muted-foreground">{orderStats.total} au total</p>
          </CardContent>
        </Card>
      </Link>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2"><Users className="h-6 w-6" />Gestion des Utilisateurs</CardTitle>
                <CardDescription>{users.length} utilisateur(s) correspondant aux filtres</CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                <div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 w-full sm:w-64" /></div>
                <div className="flex gap-2"><Select value={roleFilter} onValueChange={setRoleFilter}><SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Tous les rôles</SelectItem><SelectItem value="client">Clients</SelectItem><SelectItem value="merchant">Marchands</SelectItem></SelectContent></Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Tous les statuts</SelectItem><SelectItem value="active">Actifs</SelectItem><SelectItem value="suspended">Suspendus</SelectItem></SelectContent></Select>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="rounded-b-lg overflow-hidden">
              <Table>
                <TableHeader><TableRow className="bg-slate-50 hover:bg-slate-50"><TableHead>Utilisateur</TableHead><TableHead>Email</TableHead><TableHead>Rôle</TableHead><TableHead>Statut</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
                  ) : users.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground">Aucun utilisateur trouvé</TableCell></TableRow>
                  ) : (
                    users.map(user => (
                      <TableRow key={user._id} className="hover:bg-muted/50">
                        <TableCell className="font-medium"><div className="flex items-center gap-3"><span>{user.first_name}</span></div></TableCell>
                        <TableCell className="text-muted-foreground">{user.email}</TableCell>
                        <TableCell><Badge variant={getRoleBadgeVariant(user.role)} className="capitalize">{user.role}</Badge></TableCell>
                        <TableCell><Badge variant={user.is_active ? 'outline' : 'destructive'}>{user.is_active ? 'Actif' : 'Suspendu'}</Badge></TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/users/${user._id}`)} title="Voir les détails" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
                            {user.role !== 'admin' && (
                              <>
                                {user.is_active ? (
                                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleUpdateStatus(user._id, false); }} title="Suspendre" className="h-8 w-8 text-orange-600 hover:text-orange-700"><UserX className="h-4 w-4" /></Button>
                                ) : (
                                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleUpdateStatus(user._id, true); }} title="Réactiver" className="h-8 w-8 text-green-600 hover:text-green-700"><UserCheck className="h-4 w-4" /></Button>
                                )}
                                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDeleteUser(user._id); }} title="Supprimer" className="h-8 w-8 text-red-600 hover:text-red-700"><Trash2 className="h-4 w-4" /></Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
export default AdminDashboardPage;