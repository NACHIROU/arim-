import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User } from '@/types';
import { 
  Loader2, Trash2, UserX, UserCheck, Users, 
  Search, Eye, Store, Package, ShoppingBasket, MessageSquare 
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AdminDashboardPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState({
    users: { total: 0, active: 0, suspended: 0, clients: 0, merchants: 0, admins: 0 },
    shops: 0, products: 0, orders: 0, suggestions: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const stat = {
    total: users.length,
    active: users.filter(u => u.is_active).length,
    suspended: users.filter(u => !u.is_active).length,
    clients: users.filter(u => u.role === 'client').length,
    merchants: users.filter(u => u.role === 'merchant').length,
    admins: users.filter(u => u.role === 'admin').length,
  };

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
    const statsUrl = "http://localhost:8000/admin/stats";

    try {
      const [usersResponse, statsResponse] = await Promise.all([
        fetch(usersUrl, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(statsUrl, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (!usersResponse.ok) throw new Error("Erreur de chargement des utilisateurs.");
      if (!statsResponse.ok) throw new Error("Erreur de chargement des statistiques.");
      
      setUsers(await usersResponse.json());
      setStats(await statsResponse.json());

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
  }, [fetchData]);

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
      case 'merchant': return 'default';
      default: return 'secondary';
    }
  };

  if (isLoading && users.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard Administrateur</h1>
          <p className="text-muted-foreground">Supervision et modération de la plateforme</p>
        </div>

        {/* Stats Grid - Main */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Link to="/admin/dashboard" className="block group">
            <Card className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Utilisateurs</p>
                    <p className="text-2xl font-bold text-foreground">{stat.total}</p>
                  </div>
                  <Users className="h-5 w-5 text-primary" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/shops" className="block group">
            <Card className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Boutiques</p>
                    <p className="text-2xl font-bold text-foreground">{stats.shops}</p>
                  </div>
                  <Store className="h-5 w-5 text-primary" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/products" className="block group">
            <Card className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Produits</p>
                    <p className="text-2xl font-bold text-foreground">{stats.products}</p>
                  </div>
                  <Package className="h-5 w-5 text-primary" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/orders" className="block group">
            <Card className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Commandes</p>
                    <p className="text-2xl font-bold text-foreground">{stats.orders}</p>
                  </div>
                  <ShoppingBasket className="h-5 w-5 text-primary" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/suggestions" className="block group">
            <Card className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Messages</p>
                    <p className="text-2xl font-bold text-foreground">{stats.suggestions}</p>
                  </div>
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
        
        {/* Stats Grid - Details */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green">Actifs</p>
                  <p className="text-2xl font-bold text-green">{stat.active}</p>
                </div>
                <UserCheck className="h-5 w-5 text-green" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-destructive">Suspendus</p>
                  <p className="text-2xl font-bold text-destructive">{stat.suspended}</p>
                </div>
                <UserX className="h-5 w-5 text-destructive" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-primary">Clients</p>
                  <p className="text-2xl font-bold text-primary">{stat.clients}</p>
                </div>
                <Users className="h-5 w-5 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium  text-brown">Marchands</p>
                  <p className="text-2xl font-bold  text-brown">{stat.merchants}</p>
                </div>
                <Store className="h-5 w-5 text-brown" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-warning">Admins</p>
                  <p className="text-2xl font-bold text-warning">{stat.admins}</p>
                </div>
                <Users className="h-5 w-5 text-warning" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Management */}
        <Card>
          <CardHeader>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Gestion des Utilisateurs
                </CardTitle>
                <CardDescription>{users.length} utilisateur(s) correspondant aux filtres</CardDescription>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Rechercher..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    className="pl-10 w-full sm:w-64" 
                  />
                </div>
                
                <div className="flex gap-2">
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les rôles</SelectItem>
                      <SelectItem value="client">Clients</SelectItem>
                      <SelectItem value="merchant">Marchands</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="active">Actifs</SelectItem>
                      <SelectItem value="suspended">Suspendus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="rounded-b-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-b bg-muted/30">
                    <TableHead className="font-semibold">Utilisateur</TableHead>
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold">Rôle</TableHead>
                    <TableHead className="font-semibold">Statut</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                      </TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                        Aucun utilisateur trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map(user => (
                      <TableRow key={user._id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-medium text-primary">
                                {user.first_name?.charAt(0)?.toUpperCase()}
                              </span>
                            </div>
                            <span className="text-foreground">{user.first_name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(user.role)} className="capitalize">
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.is_active ? 'secondary' : 'destructive'}>
                            {user.is_active ? 'Actif' : 'Suspendu'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => navigate(`/admin/users/${user._id}`)} 
                              title="Voir les détails"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {user.role !== 'admin' && (
                              <>
                                {user.is_active ? (
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={(e) => { e.stopPropagation(); handleUpdateStatus(user._id, false); }} 
                                    title="Suspendre"
                                    className="text-warning hover:text-warning hover:bg-warning/10"
                                  >
                                    <UserX className="h-4 w-4" />
                                  </Button>
                                ) : (
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={(e) => { e.stopPropagation(); handleUpdateStatus(user._id, true); }} 
                                    title="Réactiver"
                                    className="text-success hover:text-success hover:bg-success/10"
                                  >
                                    <UserCheck className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={(e) => { e.stopPropagation(); handleDeleteUser(user._id); }} 
                                  title="Supprimer"
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
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