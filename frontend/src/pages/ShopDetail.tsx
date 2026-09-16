import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Boutique, Produit } from '@/types';
import { jwtDecode } from 'jwt-decode';

// UI Components & Icons
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Star, Package, Phone, Search, MapPin, Store } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';

// Custom Components
import ProductCard from '@/components/ProductCard';
import NotFound from './NotFound';
import ReviewForm from '@/components/reviews/ReviewForm';
import ReviewCard from '@/components/reviews/ReviewCard';
import { Input } from '@/components/ui/input';
import { dataService } from '@/lib/dataService';
import ImageWithFallback from '@/components/ui/ImageWithFallback';

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
  
  const [shop, setShop] = useState<ShopDetailData | null>(() => {
    if (!shopId) return null;
    return (dataService.findShopById(shopId) as ShopDetailData) || null;
  });

  const [products, setProducts] = useState<Produit[]>(() => {
    if (!shopId) return [];
    return dataService.getInitialProducts().filter(p => p.shop_id === shopId || p.shop?.id === shopId || p.shop?._id === shopId);
  });

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(!shop);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchReviews = useCallback(async () => {
    if (!shopId) return;
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      if (!baseUrl) return;
      const reviewsResponse = await fetch(`${baseUrl}/reviews/shop/${shopId}`);
      if (reviewsResponse.ok) {
        setReviews(await reviewsResponse.json());
      }
    } catch (error) {
      console.info("Avis en attente de synchronisation.");
    }
  }, [shopId]);

  const filteredProducts = useMemo(() => {
    if (!searchTerm) {
      return products;
    }
    return products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase())
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

    const fallbackShop = dataService.findShopById(shopId || '');
    if (fallbackShop) {
      setShop(fallbackShop as ShopDetailData);
      const fallbackProducts = dataService.getInitialProducts().filter(p => p.shop_id === shopId || p.shop?.id === shopId || p.shop?._id === shopId);
      if (fallbackProducts.length > 0) setProducts(fallbackProducts);
      setLoading(false);
    }

    const fetchAllData = async () => {
      if (!shopId) { setLoading(false); return; }
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL;
        if (!baseUrl) return;

        const [shopResponse, productsResponse] = await Promise.all([
          fetch(`${baseUrl}/shops/retrieve-shop/${shopId}`),
          fetch(`${baseUrl}/shops/${shopId}/products/`)
        ]);

        if (shopResponse.ok) {
          setShop(await shopResponse.json());
        }
        if (productsResponse.ok) {
          const fetchedProducts = await productsResponse.json();
          if (Array.isArray(fetchedProducts) && fetchedProducts.length > 0) {
            setProducts(fetchedProducts);
          }
        }
        
        await fetchReviews();
      } catch (error) {
        console.info("Données boutique chargées localement.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [shopId, fetchReviews]);

  if (loading && !shop) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <div className="w-10 h-10 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!shop) return <NotFound />;

  const phone = shop.contact_phone?.replace(/\D/g, '');
  const canContact = !!phone;
  const callLink = canContact ? `tel:${phone}` : '#';
  const whatsappLink = canContact ? `https://wa.me/${phone}` : '#';

  const coverImage = (shop.images && shop.images.length > 0) 
    ? shop.images[0] 
    : 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1280&q=80';

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      {/* Banner / Cover */}
      <div className="w-full bg-slate-900">
        <AspectRatio ratio={16 / 4} className="max-h-[340px]">
          <ImageWithFallback 
            src={coverImage} 
            alt={shop.name} 
            className="object-cover w-full h-full opacity-90" 
          />
        </AspectRatio>
      </div>

      {/* Profil Boutique Card */}
      <div className="container mx-auto px-4 sm:px-8">
        <div className="max-w-5xl mx-auto -mt-16 sm:-mt-20 relative bg-white border border-slate-200/90 p-6 sm:p-8 rounded-2xl shadow-sm mb-10">
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-orange-500 rounded-2xl flex items-center justify-center text-white text-3xl font-extrabold shadow-sm shrink-0 border-4 border-white">
              {shop.name.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-200/60 text-xs font-semibold px-2.5 py-0.5 rounded-md">
                  {shop.category || "Commerce"}
                </Badge>
                {shop.location && (
                  <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-orange-500" />
                    {shop.location}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                {shop.name}
              </h1>
              
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal max-w-2xl">
                {shop.description || "Bienvenue dans notre boutique officielle sur Ahimin."}
              </p>

              <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-500 pt-1">
                <div className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                  <span className="font-bold text-slate-800">4.8/5</span>
                  <span>({reviews.length} avis)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Package className="h-3.5 w-3.5 text-slate-400" />
                  <span>{products.length} articles disponibles</span>
                </div>
              </div>
            </div>

            {/* Actions Contact */}
            <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto shrink-0 pt-2 sm:pt-0">
              <Button asChild size="sm" className="h-11 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold shadow-sm" disabled={!canContact}>
                <a href={callLink} className="flex items-center justify-center gap-1.5">
                  <Phone className="h-4 w-4" /> Appeler
                </a>
              </Button>
              <Button asChild variant="outline" size="sm" className="h-11 px-4 border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-semibold shadow-sm" disabled={!canContact}>
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5">
                  <FaWhatsapp className="h-4 w-4 text-emerald-600" /> WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs Modernes */}
        <div className="max-w-5xl mx-auto">
          <Tabs defaultValue="products" className="w-full">
            <TabsList className="bg-slate-100/80 p-1 rounded-xl h-11 border border-slate-200/60 mb-8 grid w-full grid-cols-3">
              <TabsTrigger value="products" className="rounded-lg text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">
                Produits ({products.length})
              </TabsTrigger>
              <TabsTrigger value="about" className="rounded-lg text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">
                À propos
              </TabsTrigger>
              <TabsTrigger value="reviews" className="rounded-lg text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">
                Avis clients ({reviews.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="products" className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h2 className="text-xl font-bold text-slate-900">Articles disponibles</h2>
                
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="Chercher dans cette boutique..."
                    className="pl-9 h-10 bg-white border-slate-200 focus:border-orange-500 rounded-xl text-xs font-medium"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => (
                    <div key={product._id} className="h-full">
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl p-8">
                  <Store className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700">Aucun produit ne correspond à votre recherche</p>
                  <p className="text-xs text-slate-500 mt-1">Essayez un autre mot-clé.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="about" className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-4">
              <h3 className="text-lg font-bold text-slate-900">À propos de {shop.name}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{shop.description || "Aucune description supplémentaire renseignée pour cette boutique."}</p>
              {shop.location && (
                <div className="pt-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Adresse / Emplacement</span>
                  <p className="text-sm font-medium text-slate-800 mt-1">{shop.location}</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="reviews" className="space-y-6">
              {userRole === 'client' ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-6">
                  <ReviewForm shopId={shop._id} onReviewSubmitted={fetchReviews} />
                </div>
              ) : (
                <div className="text-center bg-white border border-slate-200 p-6 rounded-2xl text-slate-600 text-sm">
                  <p className="mb-3">Connectez-vous pour partager votre expérience sur cette boutique.</p>
                  {!userRole && (
                    <Button asChild size="sm" className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl">
                      <Link to="/login">Se connecter</Link>
                    </Button>
                  )}
                </div>
              )}

              <div className="space-y-4">
                {reviews.length > 0 ? (
                  reviews.map((review) => <ReviewCard key={review._id} review={review} />)
                ) : (
                  <div className="text-center py-12 bg-white border border-slate-200 rounded-2xl p-6 text-slate-500 text-xs">
                    Cette boutique n'a pas encore reçu d'avis clients.
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ShopDetail;