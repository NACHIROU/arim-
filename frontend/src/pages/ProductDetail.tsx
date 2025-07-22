
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Produit } from '@/types';
import { Loader2, Store, Phone, ChevronRight, Heart, Share2, ShoppingCart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FaWhatsapp } from 'react-icons/fa';
import { useCart } from '@/context/CartContext';

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
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/products/${productId}`);
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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-orange-400 to-amber-400 flex items-center justify-center mx-auto">
              <Loader2 className="h-10 w-10 animate-spin text-white" />
            </div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-400 to-amber-400 animate-pulse opacity-20"></div>
          </div>
          <p className="text-xl font-medium text-gray-600">Chargement du produit...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center">
        <Card className="p-8 text-center shadow-xl border-0 bg-white/80 backdrop-blur-sm rounded-3xl">
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
        {/* Breadcrumb élégant */}
        {product.shop && (
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-12 bg-white/70 backdrop-blur-xl rounded-full px-6 py-3 w-fit shadow-lg border-0">
            <Link to="/" className="hover:text-orange-500 transition-colors font-medium">Accueil</Link>
            <ChevronRight className="h-4 w-4 text-orange-300" />
            <Link to={`/shops/${product.shop_id}`} className="hover:text-orange-500 transition-colors font-medium">{product.shop.name}</Link>
            <ChevronRight className="h-4 w-4 text-orange-300" />
            <span className="text-orange-600 font-medium truncate max-w-32">{product.name}</span>
          </nav>
        )}

        <div className="grid md:grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-20">
          {/* Section Image ultra moderne */}
          <div className="lg:col-span-2 space-y-6">
            <div className="relative group">
              <div className="aspect-square bg-white rounded-3xl shadow-2xl overflow-hidden border-0 relative">
                <img 
                  src={mainImage || 'https://via.placeholder.com/600x600?text=Image+Produit'} 
                  alt={product.name}
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              </div>
              
            </div>

            {/* Galerie de miniatures futuriste */}
            {imageList.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {imageList.map((img, index) => (
                  <button 
                    key={index} 
                    onClick={() => setMainImage(img)} 
                    className={`flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                      mainImage === img 
                        ? 'border-orange-500 shadow-lg shadow-orange-500/25 scale-110' 
                        : 'border-gray-200 hover:border-orange-400 hover:scale-105 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`${product.name} miniature ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Section Information ultra moderne */}
          <div className="lg:col-span-3 space-y-10">
            {/* En-tête produit premium */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 border-0 px-4 py-2 rounded-full font-semibold">
                  <Star className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
                {product.shop && (
                  <Badge variant="outline" className="border-gray-200 text-gray-600 px-4 py-2 rounded-full">
                    <Store className="w-3 h-3 mr-1" />
                    {product.shop.name}
                  </Badge>
                )}
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-black leading-tight bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                {product.name}
              </h1>

              {product.shop && (
                <p className="text-lg text-gray-600 font-medium">
                  Vendu par : 
                  <Link to={`/shops/${product.shop_id}`} className="font-bold text-orange-600 hover:text-orange-700 hover:underline ml-1 transition-colors">
                    {product.shop.name}
                  </Link>
                </p>
              )}
            </div>

            {/* Prix avec design ultra premium */}
            <Card className="bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/10 border-0 shadow-2xl rounded-3xl overflow-hidden">
              <CardContent className="p-8">
                <div className="text-center">
                  <p className="text-sm text-orange-600 font-semibold mb-2 uppercase tracking-wider">Prix</p>
                  <p className="text-6xl font-black bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                    {product.price.toLocaleString('fr-FR')}
                    <span className="text-2xl ml-2 text-gray-500 font-normal">FCFA</span>
                  </p>
                </div>
              </CardContent>
            </Card>
            
            {/* Boutons d'action ultra modernes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Button 
                size="lg" 
                onClick={() => addToCart(product)}
                className="h-16 text-lg font-bold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 border-0 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <ShoppingCart className="h-6 w-6 mr-3" /> 
                Ajouter au panier
              </Button>
              <Button 
                size="lg" 
                disabled={!canContact} 
                className="h-16 text-lg font-bold bg-green-600 hover:bg-green-700 border-0 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
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
                className="h-16 text-lg font-bold border-2 border-gray-200 hover:border-orange-400 hover:bg-orange-50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                asChild
              >
                <a href={callLink} className="flex items-center justify-center gap-3">
                  <Phone className="h-6 w-6 text-orange-500" /> 
                  Appeler
                </a>
              </Button>
            </div>

            {/* Accordéon ultra moderne */}
            <Card className="shadow-2xl border-0 rounded-3xl overflow-hidden bg-white/80 backdrop-blur-xl">
              <CardContent className="p-0">
                <Accordion type="single" collapsible className="w-full" defaultValue="description">
                  <AccordionItem value="description" className="border-b-gray-100">
                    <AccordionTrigger className="text-xl font-bold px-8 py-6 hover:bg-gray-50/50 transition-colors">
                      Description du produit
                    </AccordionTrigger>
                    <AccordionContent className="px-8 pb-8">
                      <div className="prose max-w-none text-gray-600 text-lg leading-relaxed">
                        <p>{product.description || "Aucune description détaillée disponible."}</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="shop-info" className="border-b-0">
                    <AccordionTrigger className="text-xl font-bold px-8 py-6 hover:bg-gray-50/50 transition-colors">
                      Informations sur la boutique
                    </AccordionTrigger>
                    <AccordionContent className="px-8 pb-8">
                      {product.shop ? (
                        <Link 
                          to={`/shops/${product.shop_id}`}
                          className="flex items-center gap-4 text-orange-600 font-bold hover:text-orange-700 hover:underline text-lg group transition-colors"
                        >
                          <div className="p-4 bg-orange-100 rounded-2xl group-hover:bg-orange-200 transition-colors">
                            <Store className="h-6 w-6" />
                          </div>
                          <span>Visiter la boutique "{product.shop.name}"</span>
                        </Link>
                      ) : (
                        <p className="text-gray-600">Informations non disponibles.</p>
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
