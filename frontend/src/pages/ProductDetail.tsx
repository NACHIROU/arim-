import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Produit } from '@/types';
import { Loader2, Store, Phone, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FaWhatsapp } from 'react-icons/fa';
import NotFound from './NotFound';

const ProductDetail: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Produit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mainImage, setMainImage] = useState<string | null>(null);

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
        } else if (data.image_url) {
          setMainImage(data.image_url);
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
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement du produit...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="container mx-auto px-4 py-8 md:py-16 max-w-7xl">
        {/* Breadcrumb amélioré */}
        {product.shop && (
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-8 bg-white/70 backdrop-blur-sm rounded-full px-4 py-2 w-fit shadow-sm border">
            <Link to="/" className="hover:text-primary transition-colors font-medium">Accueil</Link>
            <ChevronRight className="h-4 w-4" />
            <Link to={`/shops/${product.shop._id}`} className="hover:text-primary transition-colors font-medium">{product.shop.name}</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-primary font-medium truncate max-w-32">{product.name}</span>
          </nav>
        )}

        <div className="grid md:grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
          {/* Section Image avec design amélioré */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative group">
              <div className="aspect-square bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200/50">
                <img 
                  src={mainImage || 'https://via.placeholder.com/600x600?text=Image+Produit'} 
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              
              {/* Boutons d'action flottants */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
              </div>
            </div>

            {/* Galerie de miniatures améliorée */}
            {imageList.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {imageList.map((img, index) => (
                  <button 
                    key={index} 
                    onClick={() => setMainImage(img)} 
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                      mainImage === img 
                        ? 'border-primary shadow-lg shadow-primary/25 scale-105' 
                        : 'border-slate-200 hover:border-primary/50 hover:scale-105 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`${product.name} miniature ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Section Information avec design amélioré */}
          <div className="lg:col-span-3 space-y-8">
            {/* En-tête produit */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  Nouveau
                </Badge>
                {product.shop && (
                  <Badge variant="outline" className="border-slate-300">
                    <Store className="w-3 h-3 mr-1" />
                    {product.shop.name}
                  </Badge>
                )}
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                {product.name}
              </h1>

              {product.shop && (
                <p className="text-lg text-muted-foreground">
                  Vendu par : 
                  <Link to={`/shops/${product.shop_id}`} className="font-semibold text-primary hover:underline ml-1 transition-colors">
                    {product.shop.name}
                  </Link>
                </p>
              )}
            </div>

            {/* Prix avec design premium */}
            <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20 shadow-lg">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Prix</p>
                  <p className="text-5xl font-bold text-primary">
                    {product.price.toLocaleString('fr-FR')}
                    <span className="text-2xl ml-2 text-muted-foreground">FCFA</span>
                  </p>
                </div>
              </CardContent>
            </Card>
            
            {/* Boutons d'action stylisés */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button 
                size="lg" 
                disabled={!canContact} 
                className="h-14 text-lg font-semibold bg-orange-600 hover:bg-orange-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
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
                className="h-14 text-lg font-semibold border-2 border-primary/20 hover:border-primary hover:bg-primary/5 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                asChild
              >
                <a href={callLink} className="flex items-center justify-center gap-3">
                  <Phone className="h-6 w-6" /> 
                  Appeler
                </a>
              </Button>
            </div>

            {/* Accordéon avec design amélioré */}
            <Card className="shadow-lg border-slate-200/50">
              <CardContent className="p-0">
                <Accordion type="single" collapsible className="w-full" defaultValue="description">
                  <AccordionItem value="description" className="border-b-slate-200/50">
                    <AccordionTrigger className="text-xl font-semibold px-6 py-4 hover:bg-slate-50/50 transition-colors">
                      Description du produit
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                      <div className="prose max-w-none text-muted-foreground text-lg leading-relaxed">
                        <p>{product.description || "Aucune description détaillée disponible."}</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="shop-info" className="border-b-0">
                    <AccordionTrigger className="text-xl font-semibold px-6 py-4 hover:bg-slate-50/50 transition-colors">
                      Informations sur la boutique
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                      {product.shop ? (
                        <Link 
                          to={`/shops/${product.shop_id}`} 
                          className="flex items-center gap-3 text-primary font-semibold hover:underline text-lg group transition-colors"
                        >
                          <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
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