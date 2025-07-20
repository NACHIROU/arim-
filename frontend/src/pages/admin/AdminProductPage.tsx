import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Produit } from '@/types';
import { Loader2, ArrowLeft, Package, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";

const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Produit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const token = localStorage.getItem('token');

  const fetchProducts = useCallback(async () => {
    if (!token) { navigate('/login'); return; }
    try {
      const response = await fetch("http://localhost:8000/admin/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Erreur de chargement des produits.");
      setProducts(await response.json());
    } catch (error) {
      toast({ title: "Erreur", description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [token, navigate, toast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce produit ? Cette action est irréversible.")) return;

    try {
      const response = await fetch(`http://localhost:8000/admin/products/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "La suppression a échoué.");
      }
      toast({ title: "Succès", description: "Produit supprimé." });
      fetchProducts(); // Rafraîchir la liste
    } catch (error) {
      toast({ title: "Erreur", description: (error as Error).message, variant: "destructive" });
    }
  };

  if (isLoading) return <div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin" /></div>;

  return (
    <div className="container mx-auto py-10">
      <Button variant="outline" onClick={() => navigate(-1)} className="mb-6">Retour au Dashboard</Button>
      <h1 className="text-3xl font-bold mb-6">Gestion de Tous les Produits</h1>
      <Card>
        <CardHeader><CardTitle>Liste de tous les produits ({products.length})</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produit</TableHead>
                <TableHead>Boutique</TableHead>
                <TableHead className="text-right">Prix</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map(product => (
                <TableRow key={product._id}>
                  <TableCell className="font-medium flex items-center gap-3">
                    <img 
                      src={product.images?.[0] || 'https://via.placeholder.com/40'} 
                      alt={product.name} 
                      className="w-10 h-10 object-cover rounded-md"
                    />
                    {product.name}
                  </TableCell>
                  <TableCell>{product.shop?.name || 'N/A'}</TableCell>
                  <TableCell className="text-right">{product.price.toLocaleString('fr-FR')} FCFA</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteProduct(product._id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer
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

export default AdminProductsPage;