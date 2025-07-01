import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from "@/components/ProductCard";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SearchFilters, { FiltersState } from '@/components/SearchFilters';
import SearchResultsDropdown from '@/components/SearchResultsDropdown';

// --- Interfaces ---
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
  category: string;
  images?: string[];
}

const Index = () => {
  // --- États pour l'affichage initial de la page ---
  const [shops, setShops] = useState<ShopFromAPI[]>([]);
  const [products, setProducts] = useState<ProductFromAPI[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // --- États pour la recherche dynamique ---
  const [filters, setFilters] = useState<FiltersState | null>(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // --- Effet pour charger les données initiales de la page d'accueil ---
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoadingInitial(true);
        const [shopsResponse, productsResponse] = await Promise.all([
          fetch("http://localhost:8000/shops/retrieve-all-shops/"),
          fetch("http://localhost:8000/products/get-all-products/")
        ]);
        if (!shopsResponse.ok || !productsResponse.ok) {
          throw new Error("Erreur lors de la récupération des données initiales.");
        }
        
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

  // --- Effet pour lancer la recherche quand les filtres changent ---
  useEffect(() => {
    const shouldSearch = filters && (filters.searchTerm.trim().length >= 2 || filters.category !== 'Tous');

    if (!shouldSearch) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchResults(filters!, position.coords);
      },
      () => {
        console.warn("Géolocalisation refusée, recherche sans proximité.");
        fetchResults(filters!);
      }
    );
  }, [filters]);

  // --- Fonction qui appelle l'API de recherche ---
  const fetchResults = async (currentFilters: FiltersState, coords?: GeolocationCoordinates) => {
    const params = new URLSearchParams();
    if (currentFilters.searchTerm) params.append('q', currentFilters.searchTerm);
    if (currentFilters.category !== 'Tous') params.append('category', currentFilters.category);
    if (currentFilters.priceRange !== 'Tous les prix') params.append('priceRange', currentFilters.priceRange);
    if (currentFilters.location !== 'Toutes les villes') params.append('location', currentFilters.location);
    if (coords) {
      params.append('lat', coords.latitude.toString());
      params.append('lon', coords.longitude.toString());
    }

    try {
      const response = await fetch(`http://localhost:8000/search/?${params.toString()}`);
      const data = await response.json();
      setSearchResults(data);
    } catch (err) {
      console.error("Erreur de recherche:", err);
    } finally {
      setIsSearching(false);
    }
  };

  if (loadingInitial) return <div className="container py-24 text-center">Chargement de la marketplace...</div>;
  if (error) return <div className="container py-24 text-center text-red-500">Erreur : {error}</div>;

  return (
    <>
      {/* Section Hero avec la recherche */}
      <section className="text-center py-20 bg-gray-50">
        <div className="container">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">La marketplace qui rapproche</h1>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-8">Découvrez et soutenez les commerçants près de chez vous.</p>
          <div className="max-w-4xl mx-auto relative">
            <SearchFilters onFiltersChange={setFilters} />
            {(isSearching || searchResults.length > 0) && (
              <SearchResultsDropdown results={searchResults} isLoading={isSearching} />
            )}
          </div>
        </div>
      </section>

      {/* Section des Boutiques à la Une */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-10">Boutiques à la Une</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {shops.slice(0, 4).map((shop) => (
              <Link to={`/shops/${shop.id}`} key={shop.id} className="block h-full">
                <Card className="h-full hover:shadow-xl transition-shadow flex flex-col">
                  <CardHeader className="p-0">
                    <img src={shop.images?.[0] || '/default-shop.jpg'} alt={shop.name} className="aspect-video object-cover rounded-t-lg" />
                  </CardHeader>
                  <CardContent className="p-4 flex-grow">
                    <Badge variant="secondary" className="mb-2">{shop.category}</Badge>
                    <h3 className="font-semibold text-lg">{shop.name}</h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/shops"><Button size="lg">Voir toutes les boutiques</Button></Link>
          </div>
        </div>
      </section>

      {/* Section Nos derniers produits */}
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
            <Link to="/products"><Button size="lg">Voir tous les produits</Button></Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default Index;