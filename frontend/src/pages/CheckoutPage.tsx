import React, { useState, useMemo, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShoppingBag, MapPin, CreditCard, Store, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { User, Produit } from '@/types'; // <-- Importer User

// --- Interfaces pour clarifier la structure des données ---
interface CartItem extends Produit {
  quantity: number;
}
interface ShopItemGroup {
  shopName: string;
  items: CartItem[];
}

const CheckoutPage: React.FC = () => {
  const { cartItems, totalPrice, clearCart } = useCart();
  const [shippingAddress, setShippingAddress] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const token = localStorage.getItem('token');



  useEffect(() => {
    const fetchUserData = async () => {
      if (!token) return;
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const user: User = await response.json();
        // On pré-remplit le champ téléphone s'il existe
        if (user.phone) {
          setContactPhone(user.phone);
        }
      }
    };
    fetchUserData();
  }, [token]);
  const groupedByShop = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const shopId = item.shop._id || 'boutique-inconnue';
      if (!acc[shopId]) {
        acc[shopId] = {
          shopName: item.shop?.name || 'Boutique Inconnue',
          items: []
        };
      }
      acc[shopId].items.push(item);
      return acc;
    }, {} as Record<string, ShopItemGroup>);
  }, [cartItems]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (shippingAddress.length < 10) {
      toast({ title: "Erreur", description: "Veuillez entrer une adresse de livraison valide.", variant: "destructive" });
      return;
    }
    if (cartItems.length === 0) {
      toast({ title: "Erreur", description: "Votre panier est vide.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    const sub_orders = Object.entries(groupedByShop).map(([shopId, group]: [string, ShopItemGroup]) => ({
      shop_id: shopId,
      shop_name: group.shopName, // <-- ON AJOUTE LE NOM DE LA BOUTIQUE ICI
      products: group.items.map(item => ({
        product_id: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      sub_total: group.items.reduce((total, item) => total + item.price * item.quantity, 0),
      status: 'En attente'
    }));

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/orders/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ shipping_address: shippingAddress, total_price: totalPrice, contact_phone: contactPhone, sub_orders }),
      });
      if (!response.ok) throw new Error("La création de la commande a échoué.");

      toast({ title: "Commande passée !", description: "Votre commande a été enregistrée avec Succès ✅ ." });
      clearCart();
      navigate('/');
    } catch (error) {
      toast({ title: "Erreur", description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-12 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)}
          className="h-8 w-8 rounded-full hover:bg-muted/80"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold text-primary">Finaliser ma commande</h1>
      </div>
      
      <form onSubmit={handlePlaceOrder}>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card className="border-border/40 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3 bg-muted/30 rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-primary">
                  <MapPin className="h-5 w-5" />
                  1. Adresse de Livraison
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5">
                <Textarea 
                  placeholder="Entrez votre adresse complète pour la livraison..."
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  rows={5}
                  required
                  className="bg-muted/20 resize-none focus:bg-gray-200 transition-colors"
                />
                <br />
                <Input 
                  type="tel"
                  placeholder="Numéro de téléphone pour la livraison"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  required
                  className="bg-muted/20 focus:bg-gray-200 transition-colors"
                />
              </CardContent>
            </Card>
            
            {Object.entries(groupedByShop).map(([shopId, shop]) => (
              <Card key={shopId} className="border-border/40 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3 bg-muted/30 rounded-t-lg">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium">
                    <Store className="h-4 w-4 text-primary" />
                    {shop.shopName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    {shop.items.map(item => (
                      <div key={item._id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/20 transition-colors">
                        <div className="w-12 h-12 rounded-md overflow-hidden border border-border/50">
                          <img 
                            src={item.images?.[0] || 'https://via.placeholder.com/80'} 
                            alt={item.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-grow">
                          <p className="font-medium text-sm line-clamp-1">{item.name}</p>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{item.price.toLocaleString('fr-FR')} FCFA × {item.quantity}</span>
                            <span className="font-semibold text-primary">{(item.price * item.quantity).toLocaleString('fr-FR')} FCFA</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div>
            <Card className="border-border/40 shadow-sm sticky top-20">
              <CardHeader className="pb-3 bg-muted/30 rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-primary">
                  <ShoppingBag className="h-5 w-5" />
                  2. Résumé de la Commande
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5">
                <div className="space-y-4">
                  <div className="bg-muted/20 p-4 rounded-md">
                    <p className="text-sm font-medium mb-3">Détail des articles ({cartItems.length})</p>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                      {cartItems.map(item => (
                        <div key={item._id} className="flex justify-between text-sm py-1 border-b border-border/20 last:border-0">
                          <span className="text-muted-foreground">{item.name} × {item.quantity}</span>
                          <span>{(item.price * item.quantity).toLocaleString('fr-FR')} FCFA</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-4 bg-primary/10 rounded-md">
                    <div className="flex justify-between font-bold text-lg text-primary">
                      <span>Total à Payer</span>
                      <span>{totalPrice.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Paiement à la livraison uniquement</p>
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || cartItems.length === 0} 
                    className="w-full mt-6 h-12 text-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                        Traitement en cours...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-5 w-5" />
                        Valider et Payer à la livraison
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="w-full text-sm" 
                    onClick={() => navigate(-1)}
                  >
                    Retour au panier
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;