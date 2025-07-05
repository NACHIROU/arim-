import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PublicBoutiqueCard from '@/components/PublicBoutiqueCard';
import ProductCard from "@/components/ProductCard";
import { Button } from '@/components/ui/button';
import SearchFilters, { FiltersState } from '@/components/SearchFilters';
import SearchResultsDropdown from '@/components/SearchResultsDropdown';
import { Loader2 } from 'lucide-react';
import { Boutique, Produit } from '@/types';
import heroImage from '@/assets/images/hero-header.jpg';

const Index: React.FC = () => {
  const [shops, setShops] = useState<Boutique[]>([]);
  const [products, setProducts] = useState<Produit[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<FiltersState | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoadingInitial(true);
        const [shopsResponse, productsResponse] = await Promise.all([
          fetch("http://localhost:8000/shops/public-shops/"),
          fetch("http://localhost:8000/products/public-products/")
        ]);
        if (!shopsResponse.ok || !productsResponse.ok) {
          throw new Error("Erreur lors de la récupération des données initiales.");
        }
        setShops(await shopsResponse.json());
        setProducts(await productsResponse.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue.");
      } finally {
        setLoadingInitial(false);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!filters || (filters.searchTerm.trim().length < 2 && filters.category === 'Tous')) {
      setSearchResults([]);
      return;
    }
    const performSearch = (coords?: GeolocationCoordinates) => {
        if (!filters) return;
        const params = new URLSearchParams();
        if (filters.searchTerm) params.append('q', filters.searchTerm);
        if (filters.category !== 'Tous') params.append('category', filters.category);
        if (filters.priceRange !== 'Tous les prix') {
          params.append('priceRange', filters.priceRange);
        }
        if (filters.location !== 'Toutes les villes') {
          params.append('location', filters.location);
        }

        if (coords) {
          params.append('lat', coords.latitude.toString());
          params.append('lon', coords.longitude.toString());
        }
        fetch(`http://localhost:8000/search/?${params.toString()}`)
            .then(res => res.json()).then(data => setSearchResults(data))
            .catch(err => console.error("Erreur de recherche:", err))
            .finally(() => setIsSearching(false));
    };

    setIsSearching(true);
    navigator.geolocation.getCurrentPosition(
      (position) => performSearch(position.coords), // Succès : on cherche avec les coordonnées
      () => { 
        console.warn("Géolocalisation refusée. Recherche sans proximité.");
        performSearch(); // Échec : on cherche quand même, mais sans les coordonnées
      }
    );
  }, [filters]);

  if (loadingInitial) return <div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin" /></div>;
  if (error) return <div className="container py-24 text-center text-red-500">Erreur : {error}</div>;

  return (
    <>
      <section 
        className="relative text-center py-24 text-white bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }} // <-- 2. On applique l'image en fond
      >
        {/* On ajoute une surcouche sombre pour la lisibilité */}
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>

        {/* Le contenu est maintenant positionné par-dessus la surcouche */}
        <div className="relative z-10 container">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">La marketplace qui rapproche</h1>
          <p className="max-w-2xl mx-auto text-lg text-slate-200 mb-8">Découvrez et soutenez les commerçants près de chez vous.</p>
          <div className="max-w-4xl mx-auto">
            <SearchFilters onFiltersChange={setFilters} />
            {(isSearching || searchResults.length > 0) && (
              <SearchResultsDropdown results={searchResults} isLoading={isSearching} />
            )}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-10">Boutiques à la Une</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {shops.slice(0, 4).map((shop) => (
              <PublicBoutiqueCard key={shop._id} boutique={shop} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/shops"><Button size="lg">Voir toutes les boutiques</Button></Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-10">Nos derniers produits</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 8).map((product) => (
              <ProductCard
                key={product._id}
                id={product._id}
                imageUrl={product.image_url}
                name={product.name}
                price={product.price}
                shopId={product.shop_id}
                shopName={product.shop?.name || ''}
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