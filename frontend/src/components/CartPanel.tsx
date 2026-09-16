import React, { useMemo } from 'react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SheetHeader, SheetTitle, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Trash2, Plus, Minus, Store, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Produit } from '@/types';
import ImageWithFallback from './ui/ImageWithFallback';

interface CartItem extends Produit {
  quantity: number;
}

export const CartPanel: React.FC = () => {
  const { cartItems, removeFromCart, updateQuantity, itemCount, totalPrice } = useCart();

  const groupedByShop = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const shopId = item.shop?._id || item.shop_id || 'unknown';
      if (!acc[shopId]) {
        acc[shopId] = {
          shopName: item.shop?.name || 'Boutique locale',
          items: []
        };
      }
      acc[shopId].items.push(item);
      return acc;
    }, {} as Record<string, { shopName: string; items: CartItem[] }>);
  }, [cartItems]);

  return (
    <div className="flex flex-col h-full bg-white">
      <SheetHeader className="pb-3 border-b border-slate-100">
        <SheetTitle className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-orange-500" />
          <span>Mon Panier</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 ml-1">
            {itemCount} {itemCount > 1 ? 'articles' : 'article'}
          </span>
        </SheetTitle>
      </SheetHeader>

      {cartItems.length > 0 ? (
        <>
          <ScrollArea className="flex-1 pr-3 -mr-3 py-4">
            <div className="space-y-4">
              {Object.entries(groupedByShop).map(([shopId, group]) => (
                <div key={shopId} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-3">
                  <h4 className="font-bold text-xs text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                    <Store className="h-3.5 w-3.5 text-orange-500" />
                    {group.shopName}
                  </h4>
                  
                  <div className="space-y-2.5">
                    {group.items.map(item => (
                      <div key={item._id} className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-200/60 shadow-xs">
                        <div className="w-14 h-14 rounded-lg overflow-hidden border border-slate-100 shrink-0">
                          <ImageWithFallback
                            src={item.images?.[0] || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=200&q=80'}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <div className="flex-grow min-w-0">
                          <p className="font-bold text-xs text-slate-900 truncate">{item.name}</p>
                          <p className="text-xs text-orange-600 font-extrabold mt-0.5">
                            {item.price.toLocaleString('fr-FR')} FCFA
                          </p>
                          
                          <div className="flex items-center gap-2 mt-2">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-6 w-6 rounded-lg border-slate-200 bg-slate-50 hover:bg-slate-100" 
                              onClick={() => updateQuantity(item._id, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-xs font-bold text-slate-800 w-4 text-center">{item.quantity}</span>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-6 w-6 rounded-lg border-slate-200 bg-slate-50 hover:bg-slate-100" 
                              onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 shrink-0" 
                          onClick={() => removeFromCart(item._id)}
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          
          <SheetFooter className="mt-auto pt-4 border-t border-slate-100">
            <div className="w-full space-y-3">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-xs font-bold text-slate-500 uppercase">Total de la commande :</span>
                <span className="font-extrabold text-lg text-slate-900">
                  {totalPrice.toLocaleString('fr-FR')} <span className="text-xs text-orange-600 font-bold">FCFA</span>
                </span>
              </div>
              <SheetClose asChild>
                <Button asChild className="w-full h-12 text-sm font-bold bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-sm transition-all">
                  <Link to="/checkout">Commander maintenant</Link>
                </Button>
              </SheetClose>
            </div>
          </SheetFooter>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-center p-6">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500 mb-3">
            <ShoppingBag className="h-7 w-7" />
          </div>
          <p className="font-bold text-slate-800 text-base mb-1">Votre panier est vide</p>
          <p className="text-xs text-slate-500 mb-6 max-w-xs">Explorez les produits de vos boutiques locales et ajoutez vos coups de cœur.</p>
          <SheetClose asChild>
            <Button asChild variant="outline" className="rounded-xl text-xs font-semibold border-slate-200">
              <Link to="/products">Découvrir les produits</Link>
            </Button>
          </SheetClose>
        </div>
      )}
    </div>
  );
};