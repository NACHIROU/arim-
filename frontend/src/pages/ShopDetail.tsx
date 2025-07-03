import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, Users, Package, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import ProductCard from '@/components/ProductCard';
import NotFound from './NotFound';
import { Boutique, Produit } from '@/types';

const ShopDetail: React.FC = () => {
  const { shopId } = useParams<{ shopId: string }>();
  const [shop, setShop] = useState<Boutique | null>(null);
  const [products, setProducts] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shopId) {
      setLoading(false);
      return;
    }

    const fetchShopDetail = async () => {
      try {
        const [shopResponse, productsResponse] = await Promise.all([
          fetch(`http://localhost:8000/shops/retrieve-shop/${shopId}`),
          fetch(`http://localhost:8000/shops/${shopId}/products/`)
        ]);

        if (!shopResponse.ok) throw new Error("Boutique non trouvée.");
        
        const shopData = await shopResponse.json();
        const productsData = productsResponse.ok ? await productsResponse.json() : [];

        // On s'assure que les données reçues sont bien des tableaux avant de les utiliser
        setShop(shopData || null);
        setProducts(Array.isArray(productsData) ? productsData : []);

      } catch (error) {
        console.error('Erreur chargement shop ou produits', error);
        setShop(null);
      } finally {
        setLoading(false);
      }
    };

    fetchShopDetail();
  }, [shopId]);

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin" /></div>;
  if (!shop) return <NotFound />;

  // --- Vérifications défensives avant l'affichage ---
  const shopName = shop.name || "Boutique sans nom";
  // On s'assure que 'images' est un tableau avant d'y accéder
  const bannerImage = (Array.isArray(shop.images) && shop.images.length > 0) ? shop.images[0] : 'https://via.placeholder.com/1280x400?text=Bienvenue';

  return (
    <div>
      <div className="mb-12">
        <AspectRatio ratio={16 / 5} className="bg-muted">
          <img src={bannerImage} alt={shopName} className="object-cover w-full h-full" />
        </AspectRatio>
      </div>

      <div className="container pb-16 md:pb-24">
        <div className="max-w-4xl mx-auto -mt-32 relative bg-background p-8 rounded-lg shadow-lg mb-12">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold shrink-0">
              {shopName.charAt(0)}
            </div>
            <div className="flex-1">
              <Badge variant="secondary" className="mb-2">{shop.category || 'Sans catégorie'}</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">{shopName}</h1>
              <p className="text-lg text-muted-foreground mb-4">{shop.description || ''}</p>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1"><Star className="h-4 w-4 text-yellow-400 fill-current" /><span>4.8/5</span></div>
                <div className="flex items-center gap-1"><Users className="h-4 w-4" /><span>-- clients</span></div>
                <div className="flex items-center gap-1"><Package className="h-4 w-4" /><span>{products.length} produits</span></div>
              </div>
              <div className="flex gap-3"><Button>Suivre</Button><Button variant="outline">Contacter</Button></div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="products" className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="products">Produits</TabsTrigger>
            <TabsTrigger value="about">À propos</TabsTrigger>
            <TabsTrigger value="reviews">Avis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="products" className="mt-8">
            <h2 className="text-3xl font-bold mb-8">Produits de {shopName}</h2>
            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {products.map((product) => (
                  // On vérifie que 'product' est un objet valide avant de le rendre
                  product && product._id && (
                    <ProductCard
                      key={product._id}
                      id={product._id}
                      imageUrl={product.image_url || ''}
                      name={product.name || 'Produit sans nom'}
                      shopName={shopName}
                      price={product.price || 0}
                      shopId={shop._id}
                    />
                  )
                ))}
              </div>
            ) : (<p className="text-center text-muted-foreground py-10">Cette boutique n'a pas encore de produits.</p>)}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ShopDetail;