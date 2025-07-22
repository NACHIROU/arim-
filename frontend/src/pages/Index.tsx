import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PublicBoutiqueCard from '@/components/PublicBoutiqueCard';
import ProductCard from "@/components/ProductCard";
import { Button } from '@/components/ui/button';
import SearchFilters, { FiltersState } from '@/components/SearchFilters';
import SearchResultsDropdown from '@/components/SearchResultsDropdown';
import { Loader2, Sparkles, TrendingUp, Star } from 'lucide-react';
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
          fetch("${import.meta.env.VITE_API_BASE_URL}/shops/public-shops/"),
          fetch("${import.meta.env.VITE_API_BASE_URL}/products/public-products/")
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
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/search/?${params.toString()}`);
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

  if (loadingInitial) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Chargement ...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl">⚠️</div>
          <h2 className="text-2xl font-bold text-destructive">Erreur de chargement</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
      <section 
        className="relative text-center py-32 text-white bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/40"></div>
        <div className="relative z-10 container px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Pourquoi chercher loin ce qui est tout près ?
              </h1>
              <p className="max-w-2xl mx-auto text-xl text-slate-200 leading-relaxed">
                Trouvez facilement des produits et services, juste à côté de vous.
              </p>
            </div>
            
            <div className="relative" ref={searchContainerRef}>
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
        </div>
      </section>

      <section className="py-20 bg-white/80 backdrop-blur-sm">
        <div className="container px-4">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Star className="h-8 w-8 text-primary" />
              <h2 className="text-4xl font-bold text-foreground">Boutiques à la Une</h2>
              <Star className="h-8 w-8 text-primary" />
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Découvrez les boutiques les plus populaires de votre région
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {shops.slice(0, 4).map((shop) => (
              <div key={shop._id} className="group">
                <PublicBoutiqueCard boutique={shop} />
              </div>
            ))}
          </div>
          
          <div className="text-center mt-16">
            <Link to="/shops">
              <Button size="lg" className="px-8 py-6 text-lg font-semibold bg-orange-500 hover:bg-orange-400 shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                <Sparkles className="h-5 w-5 mr-2" />
                Voir toutes les boutiques
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-secondary/20 to-accent/10">
        <div className="container px-4">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <TrendingUp className="h-8 w-8 text-primary" />
              <h2 className="text-4xl font-bold text-foreground">Nos derniers produits</h2>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Les nouveautés et tendances du moment
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.slice(0, 8).map((product) => (
              <div key={product._id} className="group">
                <ProductCard
                  product={product}
                />
              </div>
            ))}
          </div>
          
          <div className="text-center mt-16">
            <Link to="/products">
              <Button size="lg" className="px-8 py-6 text-lg font-semibold bg-orange-500 hover:bg-orange-400 shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                <Sparkles className="h-5 w-5 mr-2" />
                Voir tous les produits
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;