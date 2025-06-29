import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from "@/components/ProductCard";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import SearchFilters from '@/components/SearchFilters'; // ÉTAPE 1 : On réimporte le composant

// Interfaces pour les données de l'API (inchangées)
interface ProductFromAPI {
  id: string;
  name: string;
  price: number;
  image_url: string;
  seller: string;
  shop: { id: string; name: string; } | null;
}

interface ShopFromAPI {
  id: string;
  name: string;
  description: string;
  images?: string[];
}

const Index = () => {
  // États pour les boutiques, les produits, etc. (inchangés)
  const [shops, setShops] = useState<ShopFromAPI[]>([]);
  const [products, setProducts] = useState<ProductFromAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // useEffect pour charger les données initiales (inchangé)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [shopsResponse, productsResponse] = await Promise.all([
          fetch("http://localhost:8000/shops/retrieve-all-shops/"),
          fetch("http://localhost:8000/products/get-all-products/")
        ]);

        if (!shopsResponse.ok || !productsResponse.ok) {
          throw new Error("Erreur lors de la récupération des données.");
        }

        const shopsData = await shopsResponse.json();
        const productsData = await productsResponse.json();

        setShops(shopsData);
        setProducts(productsData);

      } catch (err) {
        const message = err instanceof Error ? err.message : "Une erreur inconnue est survenue.";
        setError(message);
        console.error("Erreur de fetch:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // ÉTAPE 2 : On crée une fonction de recherche factice qui ne fait rien
  const handlePlaceholderSearch = (filters: any) => {
    console.log("Recherche lancée avec les filtres (actuellement désactivée sur cette page) :", filters);
    // Intentionnellement laissée vide pour ne pas affecter les listes affichées
  };

  if (loading) return <div className="container py-24 text-center">Chargement de la marketplace...</div>;
  if (error) return <div className="container py-24 text-center text-red-500">Erreur : {error}</div>;

  return (
    <>
      {/* Hero Section */}
      <section className="text-center py-20 bg-gray-50">
        <div className="container">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">La marketplace qui rapproche</h1>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-8">Découvrez et soutenez les commerçants près de chez vous.</p>
          
          {/* ÉTAPE 3 : On réintègre le composant SearchFilters ici */}
          <div className="max-w-4xl mx-auto">
            <SearchFilters onSearch={handlePlaceholderSearch} />
          </div>
        </div>
      </section>

      {/* Section des Boutiques à la Une (inchangée) */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-10">Boutiques à la Une</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {shops.slice(0, 4).map((shop) => (
              <Link to={`/shops/${shop.id}`} key={shop.id}>
                <Card className="h-full hover:shadow-xl transition-shadow">
                  <CardHeader className="p-0">
                    <img src={shop.images?.[0] || '/default-shop.jpg'} alt={shop.name} className="aspect-video object-cover rounded-t-lg" />
                  </CardHeader>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg">{shop.name}</h3>
                    <p className="text-sm text-muted-foreground truncate">{shop.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/shops">
              <Button size="lg">Voir toutes les boutiques</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Section des Nouveaux Produits (inchangée) */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-10">Nos derniers produits</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 4).filter(p => p.shop).map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                imageUrl={product.image_url}
                name={product.name}
                seller={product.seller}
                price={product.price}
                shopId={product.shop!.id}
                showShopLink
              />
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/products">
              <Button size="lg">Voir tous les produits</Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default Index;