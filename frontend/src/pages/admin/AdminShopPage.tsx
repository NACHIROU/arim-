import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Boutique } from '@/types';
import { Loader2, ArrowLeft, Store, Trash2, Eye, EyeOff } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { Badge } from '@/components/ui/badge';

// On met à jour le type Boutique pour inclure les détails du propriétaire
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
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
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
        method: "PATCH", headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("L'opération a échoué.");
      toast({ title: "Succès", description: `Boutique ${action}e.` });
      fetchShops();
    } catch (error) {
      toast({ title: "Erreur", description: (error as Error).message, variant: "destructive" });
    }
  };

  if (isLoading) return <div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin" /></div>;

  return (
    <div className="container mx-auto py-10">
      <Button variant="outline" onClick={() => navigate(-1)} className="mb-6">Retour au Dashboard</Button>
      <h1 className="text-3xl font-bold mb-6">Gestion de Toutes les Boutiques</h1>
      <Card>
        <CardHeader><CardTitle>Liste des boutiques ({shops.length})</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Boutique</TableHead>
                <TableHead>Propriétaire</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shops.map(shop => (
                <TableRow key={shop._id}>
                  <TableCell className="font-medium">{shop.name}</TableCell>
                  <TableCell>{shop.owner_details.first_name}</TableCell>
                  <TableCell>{shop.category}</TableCell>
                  <TableCell>
                    <Badge variant={shop.is_published ? 'default' : 'outline'}>
                      {shop.is_published ? 'Publiée' : 'Non Publiée'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handlePublishToggle(shop._id, shop.is_published)}>
                      {shop.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteShop(shop._id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminShopsPage;