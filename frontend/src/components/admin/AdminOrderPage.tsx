import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Order } from '@/types';
import { Loader2, ArrowLeft, ShoppingBasket, Store, User } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const token = localStorage.getItem('token');

  const fetchOrders = useCallback(async () => {
    if (!token) { navigate('/login'); return; }
    try {
      const response = await fetch("${import.meta.env.VITE_API_BASE_URL}/admin/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Erreur de chargement des commandes.");
      setOrders(await response.json());
    } catch (error) {
      console.error(error);
      toast({ title: "Erreur", description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [token, navigate, toast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (orderId: string, shopId: string, newStatus: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/orders/${orderId}/sub_orders/${shopId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      if (!response.ok) throw new Error("La mise à jour a échoué.");
      toast({ title: "Succès", description: "Statut de la commande mis à jour." });
      fetchOrders();
    } catch (error) {
      toast({ title: "Erreur", description: (error as Error).message, variant: "destructive" });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Livrée': return 'success';
      case 'En cours de livraison': return 'default';
      case 'Annulée': return 'destructive';
      default: return 'secondary';
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
            <h1 className="text-3xl font-bold text-foreground">Gestion des Commandes</h1>
            <p className="text-muted-foreground">
              {orders.reduce((acc, order) => acc + order.sub_orders.length, 0)} commande(s) au total
            </p>
          </div>
        </div>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBasket className="h-5 w-5" />
              Liste des commandes par marchand
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="rounded-b-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-b bg-muted/30">
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">Client</TableHead>
                    <TableHead className="font-semibold">Boutique</TableHead>
                    <TableHead className="font-semibold">Produits</TableHead>
                    <TableHead className="text-right font-semibold">Total Partiel</TableHead>
                    <TableHead className="font-semibold">Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                        Aucune commande trouvée
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.flatMap(order => 
                      order.sub_orders.map(subOrder => (
                        <TableRow key={`${order._id}-${subOrder.shop_id}`} className="hover:bg-muted/30 transition-colors">
                          <TableCell className="font-medium text-foreground">
                            {new Date(order.created_at).toLocaleDateString('fr-FR')}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="text-foreground">{order.customer?.first_name || 'Client inconnu'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Store className="h-4 w-4 text-muted-foreground" />
                              <span className="text-foreground">{subOrder.shop_name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {subOrder.products.map(p => (
                                <div key={p.product_id} className="text-sm text-muted-foreground">
                                  {p.name} <span className="font-medium">×{p.quantity}</span>
                                </div>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-semibold text-foreground">
                            {subOrder.sub_total.toLocaleString('fr-FR')} FCFA
                          </TableCell>
                          <TableCell>
                            <Select
                              defaultValue={subOrder.status}
                              onValueChange={(newStatus) => handleStatusChange(order._id, subOrder.shop_id, newStatus)}
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="En attente">En attente</SelectItem>
                                <SelectItem value="En cours de livraison">En cours de livraison</SelectItem>
                                <SelectItem value="Livrée">Livrée</SelectItem>
                                <SelectItem value="Annulée">Annulée</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))
                    )
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

export default AdminOrdersPage;