import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Order } from '@/types';
import { Loader2, ArrowLeft, PackageCheck, Calendar, MapPin, User } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("http://localhost:8000/admin/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Erreur de chargement des commandes.");
        setOrders(await response.json());
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, [token]);

  // Function to get status badge variant
  const getStatusVariant = (status: string) => {
    switch(status.toLowerCase()) {
      case 'en attente': return 'outline';
      case 'préparation': return 'secondary';
      case 'expédiée': return 'default';
      case 'livrée': return 'default'; 
      case 'annulée': return 'destructive';
      default: return 'outline';
    }
  };

  if (isLoading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Chargement des commandes...</p>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center gap-3 mb-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="group"
        >
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Retour au Dashboard
        </Button>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
          <PackageCheck className="h-8 w-8" />
          Gestion des Commandes
        </h1>
      </div>
      
      <Card className="border-border/40 shadow-sm">
        <CardHeader className="pb-3 bg-muted/30">
          <CardTitle className="text-xl text-primary">Liste des commandes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-b-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="w-[120px]">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      Date
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5 text-primary" />
                      Client
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      Adresse
                    </div>
                  </TableHead>
                  <TableHead>Boutique(s)</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length > 0 ? (
                  orders.map(order => (
                    <TableRow 
                      key={order._id} 
                      className="hover:bg-muted/30 cursor-pointer transition-colors"
                      onClick={() => navigate(`/admin/orders/${order._id}`)}
                    >
                      <TableCell className="font-medium">
                        {new Date(order.created_at).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>
                        {order.sub_orders.length > 0 ? order.sub_orders.map(sub => sub.shop_name).join(", ") : "Client"}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {order.shipping_address}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          {order.sub_orders.map((so, index) => (
                            <span key={index} className="inline-block mr-1">
                              {so.shop_name}{index < order.sub_orders.length - 1 ? ", " : ""}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-primary">
                        {order.total_price.toLocaleString('fr-FR')} FCFA
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={getStatusVariant(order.status)} 
                          className="capitalize transition-all hover:scale-105"
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Aucune commande trouvée.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOrdersPage;
