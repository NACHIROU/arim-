import React, { useMemo } from 'react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SheetHeader, SheetTitle, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Trash2, Plus, Minus, Store } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Produit } from '@/types';

interface CartItem extends Produit {
  quantity: number;
}

export const CartPanel: React.FC = () => {
  const { cartItems, removeFromCart, updateQuantity, itemCount, totalPrice } = useCart();

  const groupedByShop = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const shopId = item.shop?._id || 'unknown';
      if (!acc[shopId]) {
        acc[shopId] = {
          shopName: item.shop?.name || 'Boutique Inconnue',
          items: []
        };
      }
      acc[shopId].items.push(item);
      return acc;
    }, {} as Record<string, { shopName: string; items: CartItem[] }>);
  }, [cartItems]);

  return (
    <div className="flex flex-col h-full">
      <SheetHeader className="pb-2">
        <SheetTitle className="text-2xl font-bold text-primary">Mon Panier ({itemCount})</SheetTitle>
      </SheetHeader>
      <Separator className="my-3" />

      {cartItems.length > 0 ? (
        <>
          <ScrollArea className="flex-1 pr-4 -mr-4">
            <div className="space-y-6">
              {Object.entries(groupedByShop).map(([shopId, group]) => (
                <div key={shopId} className="bg-card rounded-lg p-3 border border-border/50 shadow-sm">
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2 text-primary">
                    <Store className="h-4 w-4" />
                    {group.shopName}
                  </h4>
                  <div className="space-y-4">
                    {group.items.map(item => (
                      <div key={item._id} className="flex items-center gap-4 group hover:bg-muted/30 p-2 rounded-md transition-colors">
                        <div className="w-16 h-16 rounded-md overflow-hidden border border-border/50 shadow-sm">
                          <img
                            src={item.images?.[0] || 'https://via.placeholder.com/80'}
                            alt={item.name}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          />
                        </div>
                        <div className="flex-grow">
                          <p className="font-semibold text-sm line-clamp-1">{item.name}</p>
                          <p className="text-xs text-primary font-bold">{item.price.toLocaleString('fr-FR')} FCFA</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Button variant="outline" size="icon" className="h-6 w-6 rounded-full bg-muted/50" onClick={() => updateQuantity(item._id, item.quantity - 1)}>
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-6 text-center font-medium">{item.quantity}</span>
                            <Button variant="outline" size="icon" className="h-6 w-6 rounded-full bg-muted/50" onClick={() => updateQuantity(item._id, item.quantity + 1)}>
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-70 hover:opacity-100 hover:bg-destructive/10" onClick={() => removeFromCart(item._id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          
          <SheetFooter className="mt-auto pt-4 border-t">
            <div className="w-full space-y-4">
              <div className="flex justify-between font-bold text-lg p-2 bg-muted/30 rounded-md">
                <span>Total Général :</span>
                <span className="text-primary">{totalPrice.toLocaleString('fr-FR')} FCFA</span>
              </div>
              <SheetClose asChild>
                <Button asChild className="w-full text-lg h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all">
                  <Link to="/checkout">Valider la commande</Link>
                </Button>
              </SheetClose>
            </div>
          </SheetFooter>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <Store className="h-16 w-16 text-muted mb-4" />
          <p className="text-muted-foreground mb-2">Votre panier est vide.</p>
          <p className="text-sm text-muted-foreground mb-6">Ajoutez des produits pour continuer vos achats.</p>
          <SheetClose asChild>
            <Button asChild variant="outline">
              <Link to="/products">Découvrir les produits</Link>
            </Button>
          </SheetClose>
        </div>
      )}
    </div>
  );
};