import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@/types';
import { 
  Loader2, 
  Trash2, 
  UserX, 
  UserCheck, 
  Users, 
  Search,
  Filter,
  Eye,
  Shield,
  Settings
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const { toast } = useToast();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // Statistics calculation
  const stats = {
    total: users.length,
    active: users.filter(u => u.is_active).length,
    suspended: users.filter(u => !u.is_active).length,
    clients: users.filter(u => u.role === 'client').length,
    merchants: users.filter(u => u.role === 'merchant').length,
    admins: users.filter(u => u.role === 'admin').length,
  };

  const fetchUsers = useCallback(async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    
    const params = new URLSearchParams();
    if (roleFilter !== "all") params.append('role', roleFilter);
    if (statusFilter !== "all") params.append('status', statusFilter);
    if (searchTerm.length >= 2) params.append('search', searchTerm);
    
    const url = `http://localhost:8000/admin/users?${params.toString()}`;

    try {
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Accès non autorisé ou erreur serveur.");
      setUsers(await response.json());
    } catch (error) {
      console.error("Erreur de chargement des utilisateurs:", error);
      toast({ 
        title: "Erreur", 
        description: (error as Error).message, 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  }, [token, navigate, toast, roleFilter, statusFilter, searchTerm]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(debounce);
  }, [fetchUsers]);

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
      toast({ 
        title: "Succès", 
        description: `Utilisateur ${action} avec succès.` 
      });
      fetchUsers();
    } catch (error) {
      toast({ 
        title: "Erreur", 
        description: (error as Error).message, 
        variant: "destructive" 
      });
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
      toast({ 
        title: "Succès", 
        description: "Utilisateur supprimé avec succès." 
      });
      fetchUsers();
    } catch (error) {
      toast({ 
        title: "Erreur", 
        description: (error as Error).message, 
        variant: "destructive" 
      });
    }
  };

  const handleViewUser = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    navigate(`/admin/users/${userId}`);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'default';
      case 'merchant': return 'secondary';
      case 'client': return 'outline';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold text-foreground">
              Dashboard Administrateur
            </h1>
            <p className="text-muted-foreground">
              Gérez tous les utilisateurs de votre plateforme
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <div className="text-right">
              <div className="font-semibold">Mode Admin</div>
              <div className="text-sm text-muted-foreground">Accès complet</div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card className="border-border bg-card hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.total}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <Users className="h-3 w-3 mr-1" />
                Utilisateurs
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">Actifs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <div className="text-xs text-muted-foreground">
                {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% du total
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-600">Suspendus</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.suspended}</div>
              <div className="text-xs text-muted-foreground">
                {stats.total > 0 ? Math.round((stats.suspended / stats.total) * 100) : 0}% du total
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-600">Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.clients}</div>
              <div className="text-xs text-muted-foreground">Utilisateurs finaux</div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-600">Marchands</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.merchants}</div>
              <div className="text-xs text-muted-foreground">Vendeurs</div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-600">Admins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.admins}</div>
              <div className="text-xs text-muted-foreground">Administrateurs</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Card */}
        <Card className="border-border bg-card shadow-lg">
          <CardHeader>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Users className="h-6 w-6" />
                  Gestion des Utilisateurs
                </CardTitle>
                <CardDescription>
                  {users.length} utilisateur{users.length > 1 ? 's' : ''} trouvé{users.length > 1 ? 's' : ''}
                </CardDescription>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Rechercher par nom ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-64"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-[140px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les rôles</SelectItem>
                      <SelectItem value="client">Clients</SelectItem>
                      <SelectItem value="merchant">Marchands</SelectItem>
                      <SelectItem value="admin">Admins</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
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
            <div className="rounded-lg border-0">
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
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <Users className="h-12 w-12" />
                          <p className="text-lg font-medium">Aucun utilisateur trouvé</p>
                          <p className="text-sm">Essayez de modifier vos filtres de recherche</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map(user => (
                      <TableRow 
                        key={user._id} 
                        className="hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/admin/users/${user._id}`)}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold">
                              {user.first_name?.[0]?.toUpperCase() || '?'}
                            </div>
                            <span>{user.first_name || 'Nom non défini'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{user.email}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={getRoleBadgeVariant(user.role)}
                            className="capitalize"
                          >
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={user.is_active ? 'outline' : 'destructive'}
                            className={user.is_active ? 'text-green-600 border-green-200' : ''}
                          >
                            {user.is_active ? 'Actif' : 'Suspendu'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={(e) => handleViewUser(e, user._id)}
                              title="Voir les détails"
                              className="h-8 w-8"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            
                            {user.role !== 'admin' && (
                              <>
                                {user.is_active ? (
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUpdateStatus(user._id, false);
                                    }}
                                    title="Suspendre"
                                    className="h-8 w-8 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                  >
                                    <UserX className="h-4 w-4" />
                                  </Button>
                                ) : (
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUpdateStatus(user._id, true);
                                    }}
                                    title="Réactiver"
                                    className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                  >
                                    <UserCheck className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteUser(user._id);
                                  }}
                                  title="Supprimer définitivement"
                                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
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

export default AdminDashboard;