import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Boutique, Produit } from '@/types';
import { jwtDecode } from 'jwt-decode';

// UI Components & Icons
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Star, Package, Loader2, Phone, MessageCircle, Search } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';

// Custom Components
import ProductCard from '@/components/ProductCard';
import NotFound from './NotFound';
import ReviewForm from '@/components/reviews/ReviewForm';
import ReviewCard from '@/components/reviews/ReviewCard';
import { Input } from '@/components/ui/input';

// Interfaces
interface Review {
  _id: string;
  author_name: string;
  rating: number;
  message: string;
  created_at: string;
}
interface DecodedToken {
  role: string;
}
interface ShopDetailData extends Boutique {
  contact_phone?: string;
}

const ShopDetail: React.FC = () => {
  const { shopId } = useParams<{ shopId: string }>();
  
  const [shop, setShop] = useState<ShopDetailData | null>(null);
  const [products, setProducts] = useState<Produit[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const fetchReviews = useCallback(async () => {
    if (!shopId) return;
    try {
      const reviewsResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/reviews/shop/${shopId}`);
      if (reviewsResponse.ok) {
        setReviews(await reviewsResponse.json());
      }
    } catch (error) {
      console.error("Erreur lors du chargement des avis:", error);
    }
  }, [shopId]);

  const filteredProducts = useMemo(() => {
    if (!searchTerm) {
      return products;
    }
    return products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded: DecodedToken = jwtDecode(token);
        setUserRole(decoded.role);
      } catch (e) { console.error("Token invalide"); }
    }

    const fetchAllData = async () => {
      if (!shopId) { setLoading(false); return; }
      try {
        setLoading(true);
        const [shopResponse, productsResponse] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_BASE_URL}/shops/retrieve-shop/${shopId}`),
          fetch(`${import.meta.env.VITE_API_BASE_URL}/shops/${shopId}/products/`)
        ]);

        if (!shopResponse.ok) throw new Error("Boutique non trouvée.");
        
        setShop(await shopResponse.json());
        if (productsResponse.ok) setProducts(await productsResponse.json());
        
        await fetchReviews();

      } catch (error) {
        console.error('Erreur chargement page boutique', error);
        setShop(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [shopId, fetchReviews]);

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin" /></div>;
  if (!shop) return <NotFound />;

  const phone = shop.contact_phone?.replace(/\D/g, '');
  const canContact = !!phone;
  const callLink = canContact ? `tel:${phone}` : '#';
  const whatsappLink = canContact ? `https://wa.me/${phone}` : '#';

  return (
    <div>
      <div className="bg-white">
        <AspectRatio ratio={16 / 5} className="bg-muted">
          <img src={(shop.images && shop.images.length > 0) ? shop.images[0] : 'https://via.placeholder.com/1280x400?text=Bienvenue'} alt={shop.name} className="object-cover w-full h-full" />
        </AspectRatio>
      </div>

      <div className="container pb-16 md:pb-24 bg-white mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto -mt-32 relative bg-white p-8 rounded-lg shadow-lg mb-12">
           <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold shrink-0">{shop.name.charAt(0).toUpperCase()}</div>
            <div className="flex-1">
              <Badge variant="secondary" className="mb-2">{shop.category}</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">{shop.name}</h1>
              <p className="text-lg text-muted-foreground mb-4">{shop.description}</p>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1"><Star className="h-4 w-4 text-yellow-400 fill-current" /><span>4.8/5 ({reviews.length} avis)</span></div>
                <div className="flex items-center gap-1"><Package className="h-4 w-4" /><span>{products.length} produits</span></div>
              </div>
              <div className="flex gap-3 mt-4">
                <Button asChild disabled={!canContact}>
                  <a href={callLink}>
                    <Phone className="h-4 w-4 mr-2" /> Appeler
                  </a>
                </Button>
                <Button asChild variant="outline" disabled={!canContact}>
                  <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                    {/* 2. On utilise la nouvelle icône */}
                    <FaWhatsapp className="h-5 w-5 mr-2 text-green-500" /> Envoyer un message
                  </a>
                </Button>
              </div>
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
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
              <h2 className="text-3xl font-bold">Produits de {shop.name}</h2>
              
              {/* --- 3. On ajoute la barre de recherche --- */}
              <div className="relative w-full md:w-auto md:min-w-[300px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Rechercher dans cette boutique..."
                  className="pl-9 bg-gray-100 border-0 focus:ring-2 focus:ring-primary rounded-lg h-12"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* --- 4. On affiche la liste filtrée --- */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (<p className="text-center text-muted-foreground py-10">Aucun produit ne correspond à votre recherche dans cette boutique.</p>)}
          </TabsContent>


          <TabsContent value="about" className="mt-8 prose max-w-none">
             <h2 className="text-3xl font-bold mb-4">À propos de {shop.name}</h2>
             <p>{shop.description}</p>
          </TabsContent>

          <TabsContent value="reviews" className="mt-8">
            <h2 className="text-3xl font-bold mb-8">Avis sur {shop.name}</h2>
            {userRole === 'client' ? (
              <ReviewForm shopId={shop._id} onReviewSubmitted={fetchReviews} />
            ) : (
              <div className="text-center bg-slate-50 p-4 rounded-lg text-muted-foreground mb-8">
                <p>Vous devez être connecté en tant que client pour laisser un avis.</p>
                { !userRole && <Button asChild className="mt-2"><Link to="/login">Se connecter</Link></Button> }
              </div>
            )}
            <div className="space-y-6">
              {reviews.length > 0 ? (
                reviews.map((review) => <ReviewCard key={review._id} review={review} />)
              ) : (
                <p className="text-center text-muted-foreground py-10">Cette boutique n'a pas encore reçu d'avis.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ShopDetail;