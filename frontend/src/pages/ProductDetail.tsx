import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Produit } from '@/types';
import { Store, Phone, ChevronRight, ShoppingCart, Star, ShieldCheck, Truck, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FaWhatsapp } from 'react-icons/fa';
import { useCart } from '@/context/CartContext';
import { dataService } from '@/lib/dataService';
import ImageWithFallback from '@/components/ui/ImageWithFallback';

const ProductDetail: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Produit | null>(() => {
    if (!productId) return null;
    return dataService.findProductById(productId) || null;
  });
  const [isLoading, setIsLoading] = useState(!product);
  const [error, setError] = useState<string | null>(null);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    if (!productId) {
      setError("Aucun identifiant de produit fourni.");
      setIsLoading(false);
      return;
    }

    // Check if we already have local fallback
    const localFallback = dataService.findProductById(productId);
    if (localFallback) {
      setProduct(localFallback);
      if (localFallback.images && localFallback.images.length > 0) {
        setMainImage(localFallback.images[0]);
      }
      setIsLoading(false);
    }

    const fetchProduct = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL;
        if (!baseUrl) return;
        
        const response = await fetch(`${baseUrl}/products/${productId}`);
        if (response.ok) {
          const data: Produit = await response.json();
          setProduct(data);
          if (data.images && data.images.length > 0) {
            setMainImage(data.images[0]);
          }
        }
      } catch (err) {
        if (!localFallback) {
          setError(err instanceof Error ? err.message : "Une erreur est survenue.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  if (isLoading && !product) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-600">Chargement des informations...</p>
        </div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="p-8 text-center border-slate-200 bg-white rounded-2xl max-w-md w-full shadow-sm">
          <div className="text-rose-500 text-lg font-bold mb-2">Produit non trouvé</div>
          <p className="text-xs text-slate-500 mb-6">{error || "Cet article n'est plus disponible."}</p>
          <Button asChild className="bg-orange-500 hover:bg-orange-600 rounded-xl">
            <Link to="/products">Retourner aux produits</Link>
          </Button>
        </Card>
      </div>
    );
  }

  if (!product) return null;

  const phone = product.shop?.contact_phone?.replace(/\D/g, '');
  const canContact = !!phone;
  const callLink = canContact ? `tel:${phone}` : '#';
  const whatsappLink = canContact ? `https://wa.me/${phone}` : '#';
  
  const imageList = Array.isArray(product.images) && product.images.length > 0
    ? product.images 
    : ['https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80'];

  const currentImage = mainImage || imageList[0];

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 md:py-12">
      <div className="container mx-auto px-4 sm:px-8 max-w-6xl">
        
        {/* Fil d'Ariane épuré */}
        <nav className="flex items-center space-x-2 text-xs font-medium text-slate-500 mb-8 overflow-x-auto whitespace-nowrap">
          <Link to="/" className="hover:text-orange-600 transition-colors">Accueil</Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <Link to="/products" className="hover:text-orange-600 transition-colors">Produits</Link>
          {product.shop && (
            <>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <Link to={`/shops/${product.shop_id || product.shop.id}`} className="hover:text-orange-600 transition-colors">
                {product.shop.name}
              </Link>
            </>
          )}
          <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span className="text-slate-900 font-semibold truncate max-w-xs">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Section Image & Miniatures */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm aspect-square relative">
              <ImageWithFallback 
                src={currentImage} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Miniatures */}
            {imageList.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {imageList.map((img, index) => (
                  <button 
                    key={index} 
                    onClick={() => setMainImage(img)} 
                    className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                      currentImage === img 
                        ? 'border-orange-500 shadow-sm' 
                        : 'border-slate-200 hover:border-slate-300 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Section Infos & Actions */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Badges et Titre */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {product.shop?.category && (
                  <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-200/60 text-xs font-semibold px-2.5 py-0.5 rounded-md">
                    {product.shop.category}
                  </Badge>
                )}
                {product.shop && (
                  <Badge variant="outline" className="border-slate-200 text-slate-600 text-xs font-medium px-2.5 py-0.5 rounded-md">
                    <Store className="w-3 h-3 mr-1 text-slate-400" />
                    {product.shop.name}
                  </Badge>
                )}
              </div>
              
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight">
                {product.name}
              </h1>

              {product.shop && (
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  Vendu par : 
                  <Link to={`/shops/${product.shop_id || product.shop.id}`} className="font-bold text-orange-600 hover:underline ml-1">
                    {product.shop.name}
                  </Link>
                </p>
              )}
            </div>

            {/* Carte de Prix Épurée */}
            <div className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Prix de vente</span>
              <p className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                {product.price.toLocaleString('fr-FR')} <span className="text-lg font-bold text-orange-600">FCFA</span>
              </p>
            </div>
            
            {/* Boutons d'Action */}
            <div className="space-y-3">
              <Button 
                size="lg" 
                onClick={() => addToCart(product)}
                className="w-full h-13 text-base font-bold bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
              >
                <ShoppingCart className="h-5 w-5" /> 
                <span>Ajouter au panier</span>
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button 
                  size="lg" 
                  disabled={!canContact} 
                  className="h-12 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition-all"
                  asChild
                >
                  <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                    <FaWhatsapp className="h-4 w-4" /> 
                    <span>WhatsApp</span>
                  </a>
                </Button>

                <Button 
                  size="lg" 
                  variant="outline" 
                  disabled={!canContact} 
                  className="h-12 text-sm font-semibold border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl shadow-sm transition-all"
                  asChild
                >
                  <a href={callLink} className="flex items-center justify-center gap-2">
                    <Phone className="h-4 w-4 text-orange-500" /> 
                    <span>Appeler</span>
                  </a>
                </Button>
              </div>
            </div>

            {/* Avantages rassurants */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200/80 text-xs text-slate-600">
                <ShieldCheck className="h-4 w-4 text-orange-500 shrink-0" />
                <span className="font-medium">Commerçant vérifié</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200/80 text-xs text-slate-600">
                <Truck className="h-4 w-4 text-orange-500 shrink-0" />
                <span className="font-medium">Retrait / Livraison locale</span>
              </div>
            </div>

            {/* Accordéon Description & Boutique */}
            <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
              <Accordion type="single" collapsible defaultValue="description">
                <AccordionItem value="description" className="border-b border-slate-100">
                  <AccordionTrigger className="text-sm font-bold text-slate-900 px-5 py-4 hover:bg-slate-50 transition-colors">
                    Description du produit
                  </AccordionTrigger>
                  <AccordionContent className="px-5 pb-5 text-sm text-slate-600 leading-relaxed">
                    {product.description || "Aucune description détaillée disponible pour cet article."}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="shop-info" className="border-b-0">
                  <AccordionTrigger className="text-sm font-bold text-slate-900 px-5 py-4 hover:bg-slate-50 transition-colors">
                    À propos du vendeur
                  </AccordionTrigger>
                  <AccordionContent className="px-5 pb-5 text-sm text-slate-600">
                    {product.shop ? (
                      <Link 
                        to={`/shops/${product.shop_id || product.shop.id}`}
                        className="inline-flex items-center gap-2 text-orange-600 font-semibold hover:underline"
                      >
                        <Store className="h-4 w-4" />
                        <span>Visiter la vitrine de {product.shop.name}</span>
                      </Link>
                    ) : (
                      <p>Informations vendeur non renseignées.</p>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
