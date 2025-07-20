import React from 'react';
import { ShopWithOrders } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { Package } from 'lucide-react';

interface OrdersListProps {
  groupedOrders: ShopWithOrders[];
  onStatusChange: (orderId: string, shopId: string, newStatus: string) => void;
}

export const OrdersList: React.FC<OrdersListProps> = ({ groupedOrders, onStatusChange }) => {
  if (!groupedOrders || groupedOrders.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Package className="h-12 w-12 mx-auto mb-4" />
        <h3 className="text-lg font-semibold">Aucune commande pour le moment.</h3>
        <p className="text-sm">Les nouvelles commandes apparaîtront ici.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groupedOrders.map(group => (
        <Card key={group.shop_id} className="overflow-hidden">
          <CardHeader className="bg-muted/50">
            <CardTitle>{group.shop_name}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Produits Commandés</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {group.orders.map(order => {
                  const relevantSubOrder = order.sub_orders.find(so => so.shop_id === group.shop_id);
                  if (!relevantSubOrder) return null;

                  return (
                    <TableRow key={order._id}>
                      <TableCell>{new Date(order.created_at).toLocaleDateString('fr-FR')}</TableCell>
                      <TableCell>{order.customer?.first_name || 'Client inconnu'}</TableCell>
                      <TableCell>
                        <ul className="list-disc pl-4 text-sm">
                          {relevantSubOrder.products.map(p => (
                            <li key={p.product_id}>{p.name} (x{p.quantity})</li>
                          ))}
                        </ul>
                      </TableCell>
                      <TableCell>
                        <Select
                          defaultValue={relevantSubOrder.status}
                          onValueChange={(newStatus) => onStatusChange(order._id, relevantSubOrder.shop_id, newStatus)}
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
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};