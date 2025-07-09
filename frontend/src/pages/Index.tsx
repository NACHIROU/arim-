import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PublicBoutiqueCard from '@/components/PublicBoutiqueCard';
import ProductCard from "@/components/ProductCard";
import { Button } from '@/components/ui/button';
import SearchFilters, { FiltersState } from '@/components/SearchFilters';
import SearchResultsDropdown from '@/components/SearchResultsDropdown';
import { Loader2 } from 'lucide-react';
import { Boutique, Produit } from '@/types';
import { useClickOutside } from '@/hooks/useClickOutside';
import heroImage from '@/assets/images/hero-header.jpg';

const Index: React.FC = () => {
  const [shops, setShops] = useState<Boutique[]>([]);
  const [products, setProducts] = useState<Produit[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<FiltersState | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  // Logique pour fermer le dropdown
  const closeDropdown = () => {
    setIsDropdownVisible(false);
  };
  const searchContainerRef = useClickOutside(closeDropdown);

  // Effet pour charger les données initiales de la page
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

  // useEffect qui déclenche la recherche lorsque les filtres changent
  useEffect(() => {
    const shouldSearch = filters && (
      filters.searchTerm.trim().length >= 2 ||
      filters.category !== 'Tous' ||
      filters.priceRange !== 'Tous les prix' ||
      filters.location !== 'Toutes les villes'
    );

    if (!shouldSearch) {
      setIsDropdownVisible(false);
      return;
    }

    const executeSearch = async () => {
      setIsDropdownVisible(true);
      setIsSearching(true);

      const params = new URLSearchParams();
      if (filters.searchTerm) params.append('q', filters.searchTerm);
      if (filters.category !== 'Tous') params.append('category', filters.category);
      if (filters.priceRange !== 'Tous les prix') params.append('priceRange', filters.priceRange);
      if (filters.location !== 'Toutes les villes') params.append('location', filters.location);
      
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        params.append('lat', String(position.coords.latitude));
        params.append('lon', String(position.coords.longitude));
      } catch (geoError) {
        console.warn("Géolocalisation refusée ou impossible. Recherche sans proximité.");
      }

      try {
        const response = await fetch(`http://localhost:8000/search/?${params.toString()}`);
        if (!response.ok) throw new Error("Erreur de l'API de recherche");
        const data = await response.json();
        setSearchResults(data);
      } catch (searchError) {
        console.error("Erreur de recherche:", searchError);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    executeSearch();

  }, [filters]);

  if (loadingInitial) return <div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin" /></div>;
  if (error) return <div className="container py-24 text-center text-red-500">Erreur : {error}</div>;
  
  return (
    <>
      <section 
        className="relative text-center py-24 text-white bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative z-10 container">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Pourquoi chercher loin ce qui est tout près ?</h1>
          <p className="max-w-2xl mx-auto text-lg text-slate-200 mb-8">Trouvez facilement des produits et services, juste à côté vous.</p>
          <div className="max-w-4xl mx-auto relative" ref={searchContainerRef}>
            <SearchFilters onFiltersChange={setFilters} />
            {isDropdownVisible && (
              <SearchResultsDropdown
                results={searchResults}
                isLoading={isSearching}
                onResultClick={closeDropdown} 
              />
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
                imageUrl={(product.images && product.images.length > 0) ? product.images[0] : ''}
                name={product.name}
                price={product.price}
                shopId={product.shop_id}
                shopName={product.shop?.name || 'Boutique Inconnue'}
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