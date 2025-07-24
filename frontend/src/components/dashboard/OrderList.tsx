import React from 'react';
import { ShopWithOrders } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { Package, Store, User, Calendar, Phone } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { Button } from '@/components/ui/button';



const getStatusColorClass = (status: string) => {
  switch (status) {
    case 'En attente':
      return 'bg-gray-100 text-gray-800';
    case 'En cours de livraison':
      return 'bg-orange-100 text-orange-800';
    case 'Livrée':
      return 'bg-green-100 text-green-800';
    case 'Annulée':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-secondary text-secondary-foreground';
  }
};

interface OrdersListProps {
  groupedOrders: ShopWithOrders[];
  onStatusChange: (orderId: string, shopId: string, newStatus: string) => void;
}

export const OrdersList: React.FC<OrdersListProps> = ({ groupedOrders, onStatusChange }) => {
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Livrée': return 'success';
      case 'En cours de livraison': return 'default';
      case 'Annulée': return 'destructive';
      default: return 'secondary';
    }
  };

const formatPhoneNumberForWhatsApp = (phone?: string) => {
  if (!phone) return '';
  return phone.replace(/[^0-9]/g, ''); // Garde seulement les chiffres
};

  if (!groupedOrders || groupedOrders.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <Package className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Aucune commande</h3>
        <p className="text-sm text-muted-foreground">Les nouvelles commandes apparaîtront ici.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groupedOrders.map(group => (
        <Card key={group.shop_id} className="overflow-hidden">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Store className="h-5 w-5 text-primary" />
              {group.shop_name}
              <Badge variant="secondary" className="ml-auto">
                {group.orders.length} commande(s)
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-b bg-muted/20">
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">Client</TableHead>
                  <TableHead className="font-semibold">Produits</TableHead>
                  <TableHead className="font-semibold">Statut</TableHead>
                  <TableHead className="font-semibold">Contact Client</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {group.orders.map(order => {
                  const relevantSubOrder = order.sub_orders.find(so => so.shop_id === group.shop_id);
                  if (!relevantSubOrder) return null;

                  const customerPhone = order.customer?.phone;
                  const cleanPhone = formatPhoneNumberForWhatsApp(customerPhone);

                  return (
                    <TableRow key={order._id} className="hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-foreground">
                            {new Date(order.created_at).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-foreground">
                            {order.customer?.first_name || 'Client inconnu'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {relevantSubOrder.products.map(p => (
                            <div key={p.product_id} className="text-sm">
                              <span className="text-foreground">{p.name}</span>
                              <span className="text-muted-foreground ml-2">×{p.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          defaultValue={relevantSubOrder.status}
                          onValueChange={(newStatus) => onStatusChange(order._id, relevantSubOrder.shop_id, newStatus)}
                        >
                      <SelectTrigger className={`w-[180px] ${getStatusColorClass(relevantSubOrder.status)}`}>                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className='bg-gray-100'>
                            <SelectItem value="En attente" className='bg-gray-600'>En attente</SelectItem>
                            <SelectItem value="En cours de livraison" className='bg-orange-600'>En cours de livraison</SelectItem>
                            <SelectItem value="Livrée" className='bg-green-600'>Livrée</SelectItem>
                            <SelectItem value="Annulée" className='bg-red-600'>Annulée</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button asChild variant="outline" size="icon" disabled={!cleanPhone}>
                            <a href={`tel:${cleanPhone}`} title="Appeler le client">
                              <Phone className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button asChild variant="outline" size="icon" disabled={!cleanPhone}>
                            <a href={`https://wa.me/${cleanPhone}`} target="_blank" rel="noopener noreferrer" title="Contacter sur WhatsApp">
                              <FaWhatsapp className="h-4 w-4 text-green-600" />
                            </a>
                          </Button>
                        </div>
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