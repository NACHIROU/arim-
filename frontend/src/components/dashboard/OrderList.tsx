import React from 'react';
import { Order } from '@/types'; // Assurez-vous d'avoir ce type
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface OrdersListProps {
  orders: Order[];
  merchantShopIds: string[];
  onStatusChange: (orderId: string, shopId: string, newStatus: string) => void;
}

export const OrdersList: React.FC<OrdersListProps> = ({ orders, merchantShopIds, onStatusChange }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Client</TableHead>
          <TableHead>Produits Commandés</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Statut</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map(order => {
          // On ne garde que la sous-commande qui concerne le marchand actuel
          const relevantSubOrder = order.sub_orders.find(so => merchantShopIds.includes(so.shop_id));
          if (!relevantSubOrder) return null;

          return (
            <TableRow key={order._id}>
              <TableCell>{new Date(order.created_at).toLocaleDateString('fr-FR')}</TableCell>
              <TableCell>{order.shipping_address}</TableCell>
              <TableCell>
                <ul className="list-disc pl-4">
                  {relevantSubOrder.products.map(p => (
                    <li key={p.product_id}>{p.name} (x{p.quantity})</li>
                  ))}
                </ul>
              </TableCell>
              <TableCell>{relevantSubOrder.sub_total.toLocaleString('fr-FR')} FCFA</TableCell>
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
  );
};