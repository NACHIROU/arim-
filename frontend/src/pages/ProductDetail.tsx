import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart, Store, Star } from 'lucide-react';
import NotFound from './NotFound';
import ProductCard from '@/components/ProductCard'; // On en aura besoin pour les produits similaires

// Interfaces pour les données de l'API
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  shop_id: string;
}

interface Shop {
  id: string;
  name: string;
  description: string;
}

const ProductDetail = () => {
  const { productId } = useParams<{ productId: string }>();
  
  // États pour gérer les données dynamiques
  const [product, setProduct] = useState<Product | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      setError("Aucun ID de produit fourni.");
      return;
    }

    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        // 1. Récupérer les détails du produit principal
        const productResponse = await fetch(`http://localhost:8000/products/${productId}`);
        if (!productResponse.ok) throw new Error("Produit non trouvé.");
        const productData: Product = await productResponse.json();
        setProduct(productData);

        // 2. Utiliser le shop_id du produit pour récupérer les détails de la boutique
        if (productData.shop_id) {
          const shopResponse = await fetch(`http://localhost:8000/shops/retrieve-shop/${productData.shop_id}`);
          if (shopResponse.ok) {
            const shopData: Shop = await shopResponse.json();
            setShop(shopData);
          }
        }
        
        // 3. (Bonus) Récupérer d'autres produits pour la section "similaires"
        const allProductsResponse = await fetch(`http://localhost:8000/products/`);
        if(allProductsResponse.ok) {
            const allProductsData = await allProductsResponse.json();
            // On filtre le produit actuel et on prend les 4 premiers
            setSimilarProducts(allProductsData.filter((p: Product) => p.id !== productId).slice(0, 4));
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue.");
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId]); // L'effet se déclenche si l'ID dans l'URL change

  // Gestion des états de chargement et d'erreur
  if (loading) return <div className="container py-24 text-center">Chargement du produit...</div>;
  if (error || !product) return <NotFound />;

  // Le JSX reste très similaire, mais utilise les états au lieu des données statiques
  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image du produit */}
        <div>
          <AspectRatio ratio={1} className="bg-muted mb-4">
            <img src={product.image_url} alt={product.name} className="object-cover w-full h-full rounded-lg" />
          </AspectRatio>
        </div>

        {/* Informations du produit */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <p className="text-3xl font-bold text-primary mb-6">{product.price.toLocaleString()} FCFA</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-3">Description</h2>
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          </div>
          {/* ... autres sections ... */}

          {/* Actions */}
          <div className="space-y-4">
            <Button size="lg" className="w-full">
              <ShoppingCart className="mr-2 h-4 w-4" /> Ajouter au panier
            </Button>
            {shop && (
              <Link to={`/shops/${shop.id}`}>
                <Button variant="outline" size="lg" className="w-full">
                  <Store className="mr-2 h-4 w-4" /> Voir la boutique {shop.name}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Produits similaires (maintenant dynamiques) */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-8">Vous aimerez aussi</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {similarProducts.map((p) => (
             <ProductCard 
                key={p.id}
                id={p.id}
                imageUrl={p.image_url}
                name={p.name}
                seller={p.name || "..."}
                price={p.price}
                shopId={p.shop_id}
                showShopLink
             />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;