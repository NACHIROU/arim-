import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Produit } from '@/types'; // On utilise directement le type central
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// L'interface locale ProductDetailData n'est plus nécessaire

const ProductDetail: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  // On utilise directement le type Produit
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
        // La route de votre API doit pouvoir renvoyer les détails du produit
        // avec les infos du vendeur et de la boutique
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

  // Le reste du fichier JSX ne change pas
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin" /></div>;
  }

  if (error || !product) {
    return <div className="text-center py-24 text-red-500">Erreur : {error || "Produit introuvable."}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid md:grid-cols-2 gap-8 md:gap-12">
        <div>
          <img 
            src={product.image_url || 'https://via.placeholder.com/600x600?text=Image+Produit'} 
            alt={product.name}
            className="w-full rounded-lg shadow-lg"
          />
        </div>
        <div className="flex flex-col">
          <h1 className="text-3xl md:text-4xl font-bold">{product.name}</h1>
          
          {/* On vérifie que product.shop existe avant de l'afficher */}
          {product.shop && (
            <Link to={`/shops/${product.shop_id}`} className="mt-2">
              <Badge variant="secondary" className="text-base hover:bg-secondary/80">
                Vendu par {product.shop.name}
              </Badge>
            </Link>
          )}

          <p className="text-3xl font-bold text-primary my-4">
            {product.price.toLocaleString('fr-FR')} FCFA
          </p>
          
          <div className="prose text-muted-foreground mt-4">
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p>{product.description || "Aucune description disponible."}</p>
          </div>

          <div className="mt-auto pt-6">
            <Button size="lg" className="w-full">
              Contacter le vendeur
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;