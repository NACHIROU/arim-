
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { User, Boutique, Produit } from '@/types';
import { 
  Loader2, 
  Store, 
  Package, 
  Trash2, 
  ArrowLeft, 
  User as UserIcon, 
  Mail, 
  Phone, 
  Shield, 
  Activity,
  ShoppingBag,
  Eye
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductDetailModal } from '@/components/admin/ProductDetailModal';

const AdminUserDetailPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [shops, setShops] = useState<Boutique[]>([]);
  const [productsByShop, setProductsByShop] = useState<Record<string, Produit[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const token = localStorage.getItem('token');
  
  // État pour savoir quel produit est actuellement affiché dans le modal
  const [viewingProduct, setViewingProduct] = useState<Produit | null>(null);

  const fetchData = useCallback(async () => {
    if (!userId) return;
    
    // On ne met le chargement principal qu'au début
    if (!user) setIsLoading(true);

    try {
      // Récupérer les infos de l'utilisateur
      const userRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!userRes.ok) throw new Error("Utilisateur non trouvé");
      const userData = await userRes.json();
      setUser(userData);

      // Si c'est un marchand, récupérer ses boutiques et produits
      if (userData.role === 'merchant') {
        const shopsRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/users/${userId}/shops`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (shopsRes.ok) {
          const shopsData = await shopsRes.json();
          setShops(shopsData);
          
          const productsData: Record<string, Produit[]> = {};
          for (const shop of shopsData) {
            const productsRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/shops/${shop._id}/products/`);
            if (productsRes.ok) {
              productsData[shop._id] = await productsRes.json();
            }
          }
          setProductsByShop(productsData);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleProductDeleted = () => {
    setViewingProduct(null);
    fetchData();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Chargement du profil utilisateur...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 flex items-center justify-center">
        <div className="text-center space-y-4">
          <UserIcon className="h-16 w-16 text-muted-foreground mx-auto" />
          <h2 className="text-2xl font-bold">Utilisateur non trouvé</h2>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>
      </div>
    );
  }

  const totalProducts = Object.values(productsByShop).reduce((acc, products) => acc + products.length, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Profil Utilisateur</h1>
            <p className="text-muted-foreground">Détails et gestion du compte</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Card */}
          <Card className="lg:col-span-2 shadow-lg border-border/50">
            <CardHeader className="pb-4">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-2xl font-bold">
                  {user.first_name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-2xl text-foreground">{user.first_name}</CardTitle>
                  <p className="text-muted-foreground">{user.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge 
                      variant={user.role === 'admin' ? 'default' : 'secondary'}
                      className="capitalize"
                    >
                      {user.role}
                    </Badge>
                    <Badge 
                      variant={user.is_active ? 'outline' : 'destructive'}
                      className={user.is_active ? 'text-green-600 border-green-200' : ''}
                    >
                      {user.is_active ? 'Actif' : 'Suspendu'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    Email
                  </div>
                  <p className="text-sm">{user.email}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    Téléphone
                  </div>
                  <p className="text-sm">{user.phone || 'Non renseigné'}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  Statut du compte
                </div>
                <p className="text-sm">
                  {user.is_active 
                    ? "Compte actif avec accès complet aux fonctionnalités" 
                    : "Compte suspendu - accès restreint"
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Stats Card for Merchants */}
          {user.role === 'merchant' && (
            <Card className="shadow-lg border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  Statistiques
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{shops.length}</div>
                  <div className="text-sm text-muted-foreground">Boutique{shops.length > 1 ? 's' : ''}</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-r from-secondary/20 to-accent/20 rounded-lg">
                  <div className="text-2xl font-bold text-foreground">{totalProducts}</div>
                  <div className="text-sm text-muted-foreground">Produit{totalProducts > 1 ? 's' : ''}</div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Merchant Content */}
        {user.role === 'merchant' && (
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-6">
              <ShoppingBag className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Boutiques & Produits</h2>
            </div>
            
            <div className="space-y-6">
              {shops.map(shop => (
                <Card key={shop._id} className="shadow-lg border-border/50">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                          <Store className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{shop.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {productsByShop[shop._id]?.length || 0} produit{(productsByShop[shop._id]?.length || 0) > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {productsByShop[shop._id]?.length > 0 ? (
                      <div className="space-y-3">
                        <h3 className="font-semibold text-foreground flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          Produits
                        </h3>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {productsByShop[shop._id].map(product => (
                            <div 
                              key={product._id} 
                              className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-secondary/30 transition-colors"
                            >
                              <img 
                                src={(product.images && product.images.length > 0) ? product.images[0] : 'https://via.placeholder.com/48?text=P'} 
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded-lg border border-border/50"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-foreground truncate">{product.name}</p>
                                <p className="text-sm text-primary font-semibold">
                                  {product.price.toLocaleString('fr-FR')} FCFA
                                </p>
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setViewingProduct(product)}
                                className="hover:bg-primary hover:text-primary-foreground"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Voir
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">Aucun produit dans cette boutique</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {shops.length === 0 && (
                <Card className="shadow-lg border-border/50">
                  <CardContent className="text-center py-12">
                    <Store className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">Aucune boutique</h3>
                    <p className="text-muted-foreground">Ce marchand n'a pas encore créé de boutique.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        <ProductDetailModal 
          product={viewingProduct}
          isOpen={!!viewingProduct}
          onClose={() => setViewingProduct(null)}
          onProductDeleted={handleProductDeleted}
        />
      </div>
    </div>
  );
};

export default AdminUserDetailPage;