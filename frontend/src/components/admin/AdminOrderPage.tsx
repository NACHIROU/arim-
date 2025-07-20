import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Order } from '@/types';
import { Loader2, ArrowLeft, PackageCheck, Calendar, User, Store, Wallet } from 'lucide-react';
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
      const response = await fetch("http://localhost:8000/admin/orders", {
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
      const response = await fetch(`http://localhost:8000/admin/orders/${orderId}/sub_orders/${shopId}/status`, {
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

  if (isLoading) return <div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin" /></div>;

  return (
    <div className="container mx-auto py-10">
      <Button variant="outline" onClick={() => navigate(-1)} className="mb-6">Retour au Dashboard</Button>
      <h1 className="text-3xl font-bold mb-6">Gestion de Toutes les Commandes</h1>
      <Card>
        <CardHeader><CardTitle>Liste des commandes par marchand</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Boutique</TableHead>
                <TableHead>Produits</TableHead>
                <TableHead className="text-right">Total Partiel</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.flatMap(order => 
                order.sub_orders.map(subOrder => (
                  <TableRow key={`${order._id}-${subOrder.shop_id}`}>
                    <TableCell className="font-medium">{new Date(order.created_at).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell>{order.customer?.first_name || 'Client inconnu'}</TableCell>
                    <TableCell>{subOrder.shop_name}</TableCell>
                    <TableCell>
                      <ul className="list-disc pl-4 text-sm">
                        {subOrder.products.map(p => (
                          <li key={p.product_id}>{p.name} (x{p.quantity})</li>
                        ))}
                      </ul>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
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
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOrdersPage;