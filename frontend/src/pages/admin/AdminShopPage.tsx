import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Boutique } from '@/types';
import { Loader2, ArrowLeft, Store, Trash2, Eye, EyeOff, User } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { Badge } from '@/components/ui/badge';

interface AdminBoutique extends Boutique {
  owner_details: {
    first_name: string;
    email: string;
  }
}

const AdminShopsPage: React.FC = () => {
  const [shops, setShops] = useState<AdminBoutique[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const token = localStorage.getItem('token');

  const fetchShops = useCallback(async () => {
    if (!token) { navigate('/login'); return; }
    try {
      const response = await fetch("http://localhost:8000/admin/shops", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Erreur de chargement des boutiques.");
      setShops(await response.json());
    } catch (error) {
      toast({ title: "Erreur", description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [token, navigate, toast]);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  const handleDeleteShop = async (shopId: string) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette boutique et tous ses produits ?")) return;
    try {
      const response = await fetch(`http://localhost:8000/admin/shops/${shopId}`, {
        method: 'DELETE', 
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("La suppression a échoué.");
      toast({ title: "Succès", description: "Boutique supprimée." });
      fetchShops();
    } catch (error) {
      toast({ title: "Erreur", description: (error as Error).message, variant: "destructive" });
    }
  };

  const handlePublishToggle = async (shopId: string, isPublished: boolean) => {
    const action = isPublished ? 'dépublier' : 'publier';
    const endpoint = isPublished ? `/shops/unpublish/${shopId}` : `/shops/publish/${shopId}`;
    try {
      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: "PATCH", 
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("L'opération a échoué.");
      toast({ title: "Succès", description: `Boutique ${action}e.` });
      fetchShops();
    } catch (error) {
      toast({ title: "Erreur", description: (error as Error).message, variant: "destructive" });
    }
  };

  if (isLoading) {
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
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            size="sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestion des Boutiques</h1>
            <p className="text-muted-foreground">{shops.length} boutique(s) au total</p>
          </div>
        </div>

        {/* Shops Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Liste des boutiques
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="rounded-b-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-b bg-muted/30">
                    <TableHead className="font-semibold">Boutique</TableHead>
                    <TableHead className="font-semibold">Propriétaire</TableHead>
                    <TableHead className="font-semibold">Catégorie</TableHead>
                    <TableHead className="font-semibold">Statut</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shops.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                        Aucune boutique trouvée
                      </TableCell>
                    </TableRow>
                  ) : (
                    shops.map(shop => (
                      <TableRow key={shop._id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <Store className="h-4 w-4 text-primary" />
                            </div>
                            <span className="text-foreground">{shop.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-foreground">{shop.owner_details.first_name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="capitalize">
                            {shop.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={shop.is_published ? 'default' : 'secondary'}>
                            {shop.is_published ? 'Publiée' : 'Non Publiée'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handlePublishToggle(shop._id, shop.is_published)}
                              title={shop.is_published ? 'Dépublier' : 'Publier'}
                              className={shop.is_published 
                                ? "text-warning hover:text-warning hover:bg-warning/10" 
                                : "text-success hover:text-success hover:bg-success/10"
                              }
                            >
                              {shop.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDeleteShop(shop._id)}
                              title="Supprimer"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
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

export default AdminShopsPage;