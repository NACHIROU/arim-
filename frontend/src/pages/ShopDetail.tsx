import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Phone, Mail, Star, Users, Package } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import NotFound from './NotFound';

interface Shop {
  id: string;
  name: string;
  description: string;
  images?: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  shop_id: string;
}

const ShopDetail = () => {
  const { shopId } = useParams<{ shopId: string }>();
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShopDetail = async () => {
      try {
        const resShop = await fetch(`http://localhost:8000/shops/retrieve-shop/${shopId}`);
        if (resShop.ok) {
          const shopData = await resShop.json();
          setShop(shopData);
        } else {
          setShop(null);
        }

        const resProducts = await fetch(`http://localhost:8000/shops/${shopId}/products/`);
        if (resProducts.ok) {
          const productsData = await resProducts.json();
          setProducts(productsData);
        }
      } catch (error) {
        console.error('Erreur chargement shop ou produits', error);
      } finally {
        setLoading(false);
      }
    };

    if (shopId) {
      fetchShopDetail();
    }
  }, [shopId]);

  if (loading) return <p>Chargement...</p>;
  if (!shop) return <NotFound />;

  return (
    <div>
      {/* Bannière avec image de la boutique */}
      <div className="mb-12">
        <AspectRatio ratio={16 / 5} className="bg-muted">
          <img
            src={shop.images || '/default-shop.jpg'}
            alt={shop.name}
            className="object-cover w-full h-full"
          />
        </AspectRatio>
      </div>

      <div className="container pb-16 md:pb-24">
        {/* Header */}
        <div className="max-w-4xl mx-auto -mt-32 relative bg-background p-8 rounded-lg shadow-lg mb-12">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold shrink-0">
              {shop.name.charAt(0)}
            </div>

            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold mb-2">{shop.name}</h1>
              <p className="text-lg text-muted-foreground mb-4">{shop.description}</p>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span>4.8/5 (234 avis)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>1,567 clients</span>
                </div>
                <div className="flex items-center gap-1">
                  <Package className="h-4 w-4" />
                  <span>{products.length} produits</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button>Suivre cette boutique</Button>
                <Button variant="outline">Contacter</Button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="products" className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="products">Produits</TabsTrigger>
            <TabsTrigger value="about">À propos</TabsTrigger>
            <TabsTrigger value="reviews">Avis clients</TabsTrigger>
          </TabsList>

          {/* Onglet Produits */}
          <TabsContent value="products" className="mt-8">
            <h2 className="text-3xl font-bold mb-8">Produits de {shop.name}</h2>
            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {products.map((product, index) => (
                  <div
                    key={product.id}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${0.1 + index * 0.1}s` }}
                  >
                    <ProductCard
                      id={product.id}
                      imageUrl={product.image_url}
                      name={product.name}
                      seller={shop.name}
                      price={product.price}
                      shopId={product.shop_id}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-10">Cette boutique n'a pas encore de produits.</p>
            )}
          </TabsContent>

          {/* Onglet À propos */}
          <TabsContent value="about" className="mt-8">
            {/* Contenu à propos */}
            {/* ... (inchangé) */}
          </TabsContent>

          {/* Onglet Avis */}
          <TabsContent value="reviews" className="mt-8">
            {/* Contenu avis */}
            {/* ... (inchangé) */}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ShopDetail;
