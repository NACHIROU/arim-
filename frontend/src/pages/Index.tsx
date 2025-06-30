import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from "@/components/ProductCard";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import SearchFilters from '@/components/SearchFilters';
import SearchResultsDropdown from '@/components/SearchResultsDropdown';

// Interfaces pour les données de l'API
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
  // États pour l'affichage initial de la page
  const [shops, setShops] = useState<ShopFromAPI[]>([]);
  const [products, setProducts] = useState<ProductFromAPI[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // États pour la recherche en temps réel
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Effet pour charger les données initiales (boutiques et produits à la une)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [shopsResponse, productsResponse] = await Promise.all([
          fetch("http://localhost:8000/shops/retrieve-all-shops/"),
          fetch("http://localhost:8000/products/get-all-products/")
        ]);
        if (!shopsResponse.ok || !productsResponse.ok) throw new Error("Erreur de récupération des données.");
        
        const shopsData = await shopsResponse.json();
        const productsData = await productsResponse.json();
        setShops(shopsData);
        setProducts(productsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue.");
      } finally {
        setLoadingInitial(false);
      }
    };
    fetchInitialData();
  }, []);

  // Effet pour la recherche "live"
  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    const debounce = setTimeout(() => {
      fetch(`http://localhost:8000/search/?q=${searchTerm}`)
        .then(res => res.json())
        .then(data => setSearchResults(data))
        .catch(console.error)
        .finally(() => setIsSearching(false));
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm]);

  if (loadingInitial) return <div className="container py-24 text-center">Chargement de la marketplace...</div>;
  if (error) return <div className="container py-24 text-center text-red-500">Erreur : {error}</div>;

  return (
    <>
      {/* Hero Section avec la recherche */}
      <section className="text-center py-20 bg-gray-50">
        <div className="container">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">La marketplace qui rapproche</h1>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-8">Découvrez et soutenez les commerçants près de chez vous.</p>
          <div className="max-w-2xl mx-auto relative">
            <SearchFilters 
              searchTerm={searchTerm}
              onSearchTermChange={setSearchTerm}
              placeholder="Rechercher un produit ou une boutique..."
            />
            {searchTerm.trim().length >= 2 && (
              <SearchResultsDropdown results={searchResults} isLoading={isSearching} />
            )}
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* PARTIE RÉINTÉGRÉE : Affichage des boutiques à la une                  */}
      {/* ===================================================================== */}
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

      {/* ===================================================================== */}
      {/* PARTIE RÉINTÉGRÉE : Affichage des derniers produits                  */}
      {/* ===================================================================== */}
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