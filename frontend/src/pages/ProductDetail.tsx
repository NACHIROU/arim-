
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Produit } from '@/types';
import { Loader2, Store, Phone, ChevronRight, Heart, Share2, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FaWhatsapp } from 'react-icons/fa';
import { useCart } from '@/context/CartContext';
import NotFound from './NotFound';

const ProductDetail: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Produit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    if (!productId) {
      setError("Aucun identifiant de produit fourni.");
      setIsLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`http://localhost:8000/products/${productId}`);
        if (!response.ok) {
          throw new Error("Produit non trouvé ou non disponible.");
        }
        const data: Produit = await response.json();
        setProduct(data);
        
        if (data.images && data.images.length > 0) {
          setMainImage(data.images[0]);
        } else if (data.images) {
          setMainImage(data.images[0]);
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto" />
          <p className="text-muted-foreground text-lg">Chargement du produit...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <Card className="p-8 text-center shadow-lg">
          <div className="text-red-500 text-xl font-semibold">Erreur : {error || "Produit introuvable."}</div>
        </Card>
      </div>
    );
  }

  const phone = product.shop?.contact_phone?.replace(/\D/g, '');
  const canContact = !!phone;
  const callLink = canContact ? `tel:${phone}` : '#';
  const whatsappLink = canContact ? `https://wa.me/${phone}` : '#';
  
  const imageList = Array.isArray(product.images) ? product.images : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <div className="container mx-auto px-4 py-8 md:py-16 max-w-7xl">
        {/* Enhanced breadcrumb */}
        {product.shop && (
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-8 bg-white/70 backdrop-blur-sm rounded-full px-6 py-3 w-fit shadow-lg border border-orange-100">
            <Link to="/" className="hover:text-orange-500 transition-colors font-medium">Accueil</Link>
            <ChevronRight className="h-4 w-4 text-orange-300" />
            <Link to={`/shops/${product.shop_id}`} className="hover:text-orange-500 transition-colors font-medium">{product.shop.name}</Link>
            <ChevronRight className="h-4 w-4 text-orange-300" />
            <span className="text-orange-600 font-medium truncate max-w-32">{product.name}</span>
          </nav>
        )}

        <div className="grid md:grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
          {/* Enhanced image section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="relative group">
              <div className="aspect-square bg-white rounded-3xl shadow-2xl overflow-hidden border border-orange-100">
                <img 
                  src={mainImage || 'https://via.placeholder.com/600x600?text=Image+Produit'} 
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              
              {/* Floating action buttons */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <Button size="icon" variant="secondary" className="h-10 w-10 bg-white/90 hover:bg-white shadow-lg border border-orange-100">
                  <Heart className="h-5 w-5 text-orange-500" />
                </Button>
                <Button size="icon" variant="secondary" className="h-10 w-10 bg-white/90 hover:bg-white shadow-lg border border-orange-100">
                  <Share2 className="h-5 w-5 text-orange-500" />
                </Button>
              </div>
            </div>

            {/* Enhanced thumbnail gallery */}
            {imageList.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {imageList.map((img, index) => (
                  <button 
                    key={index} 
                    onClick={() => setMainImage(img)} 
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                      mainImage === img 
                        ? 'border-orange-500 shadow-lg shadow-orange-500/25 scale-105' 
                        : 'border-orange-200 hover:border-orange-400 hover:scale-105 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`${product.name} miniature ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Enhanced product information */}
          <div className="lg:col-span-3 space-y-8">
            {/* Product header */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200">
                  Nouveau
                </Badge>
                {product.shop && (
                  <Badge variant="outline" className="border-orange-300 text-orange-700">
                    <Store className="w-3 h-3 mr-1" />
                    {product.shop.name}
                  </Badge>
                )}
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                {product.name}
              </h1>

              {product.shop && (
                <p className="text-lg text-muted-foreground">
                  Vendu par : 
                  <Link to={`/shops/${product.shop_id}`} className="font-semibold text-orange-600 hover:text-orange-700 hover:underline ml-1 transition-colors">
                    {product.shop.name}
                  </Link>
                </p>
              )}
            </div>

            {/* Premium price display */}
            <Card className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 border-orange-200 shadow-xl">
              <CardContent className="p-8">
                <div className="text-center">
                  <p className="text-sm text-orange-600 font-medium mb-2">Prix</p>
                  <p className="text-5xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                    {product.price.toLocaleString('fr-FR')}
                    <span className="text-2xl ml-2 text-muted-foreground">FCFA</span>
                  </p>
                </div>
              </CardContent>
            </Card>
            
            {/* Styled action buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Button 
                size="lg" 
                onClick={() => addToCart(product)}
                className="h-14 text-lg font-semibold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <ShoppingCart className="h-6 w-6 mr-2" /> 
                Ajouter au panier
              </Button>
              <Button 
                size="lg" 
                disabled={!canContact} 
                className="h-14 text-lg font-semibold bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                asChild
              >
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3">
                  <FaWhatsapp className="h-6 w-6" /> 
                  WhatsApp
                </a>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                disabled={!canContact} 
                className="h-14 text-lg font-semibold border-2 border-orange-300 hover:border-orange-400 hover:bg-orange-50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                asChild
              >
                <a href={callLink} className="flex items-center justify-center gap-3">
                  <Phone className="h-6 w-6 text-orange-500" /> 
                  Appeler
                </a>
              </Button>
            </div>

            {/* Enhanced accordion */}
            <Card className="shadow-xl border-orange-100">
              <CardContent className="p-0">
                <Accordion type="single" collapsible className="w-full" defaultValue="description">
                  <AccordionItem value="description" className="border-b-orange-100">
                    <AccordionTrigger className="text-xl font-semibold px-6 py-5 hover:bg-orange-50/50 transition-colors">
                      Description du produit
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                      <div className="prose max-w-none text-muted-foreground text-lg leading-relaxed">
                        <p>{product.description || "Aucune description détaillée disponible."}</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="shop-info" className="border-b-0">
                    <AccordionTrigger className="text-xl font-semibold px-6 py-5 hover:bg-orange-50/50 transition-colors">
                      Informations sur la boutique
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                      {product.shop ? (
                        <Link 
                          to={`/shops/${product.shop_id}`}
                          className="flex items-center gap-3 text-orange-600 font-semibold hover:text-orange-700 hover:underline text-lg group transition-colors"
                        >
                          <div className="p-3 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                            <Store className="h-6 w-6" />
                          </div>
                          <span>Visiter la boutique "{product.shop.name}"</span>
                        </Link>
                      ) : (
                        <p className="text-muted-foreground">Informations non disponibles.</p>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
