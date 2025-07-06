import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Produit } from '@/types';
import { Loader2, Store, Phone, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FaWhatsapp } from 'react-icons/fa';

const ProductDetail: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Produit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin" /></div>;
  }

  if (error || !product) {
    return <div className="text-center py-24 text-red-500">Erreur : {error || "Produit introuvable."}</div>;
  }

  // --- On utilise la même logique que sur ShopDetail ---
  const phone = product.shop?.contact_phone?.replace(/\D/g, '');
  const canContact = !!phone;
  const callLink = canContact ? `tel:${phone}` : '#';
  const whatsappLink = `https://wa.me/${phone}`;

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
        
        <div className="w-full">
          <div className="sticky top-24">
            <img 
              src={product.image_url || 'https://via.placeholder.com/600x600?text=Image+Produit'} 
              alt={product.name}
              className="w-full h-auto aspect-square object-cover rounded-lg shadow-lg"
            />
          </div>
        </div>

        <div className="flex flex-col">
          {product.shop && (
            <div className="text-sm text-muted-foreground mb-2">
              <Link to="/" className="hover:text-primary">Accueil</Link>
              <ChevronRight className="h-4 w-4 inline-block mx-1" />
              <Link to={`/shops/${product.shop._id}`} className="hover:text-primary">{product.shop.name}</Link>
            </div>
          )}
          
          <h1 className="text-3xl lg:text-4xl font-bold leading-tight">{product.name}</h1>

          {product.shop && (
             <p className="text-md text-muted-foreground mt-2">
              Vendu par : 
              <Link to={`/shops/${product.shop_id}`} className="font-semibold text-primary hover:underline ml-1">
                {product.shop.name}
              </Link>
            </p>
          )}

          <p className="text-4xl font-bold text-primary my-6">
            {product.price.toLocaleString('fr-FR')} FCFA
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            <Button size="lg" disabled={!canContact} asChild>
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                <FaWhatsapp className="h-5 w-5" /> Message WhatsApp
              </a>
            </Button>
            <Button size="lg" variant="outline" disabled={!canContact} asChild>
              <a href={callLink} className="flex items-center gap-2">
                <Phone className="h-5 w-5" /> Appeler
              </a>
            </Button>
          </div>

          <Accordion type="single" collapsible className="w-full" defaultValue="description">
            <AccordionItem value="description">
              <AccordionTrigger className="text-lg font-semibold">Description</AccordionTrigger>
              <AccordionContent className="prose max-w-none text-muted-foreground">
                <p>{product.description || "Aucune description détaillée disponible."}</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="shop-info">
              <AccordionTrigger className="text-lg font-semibold">Informations sur la boutique</AccordionTrigger>
              <AccordionContent>
                {product.shop ? (
                  <Link to={`/shops/${product.shop_id}`} className="flex items-center gap-2 text-primary font-semibold hover:underline">
                    <Store className="h-5 w-5" />
                    <span>Visiter la boutique "{product.shop.name}"</span>
                  </Link>
                ) : (
                  <p>Informations non disponibles.</p>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;