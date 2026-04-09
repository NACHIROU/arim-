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
          fetch(`${import.meta.env.VITE_API_BASE_URL}/shops/public-shops/`),
          fetch(`${import.meta.env.VITE_API_BASE_URL}/products/public-products/`)
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Chargement ...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl">⚠️</div>
          <h2 className="text-2xl font-bold text-destructive">Erreur de chargement</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <section 
        className="relative text-center py-32 text-white bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
        <div className="relative z-10 container px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight">
                Pourquoi chercher loin ce qui est <span className="text-orange-500">tout près ?</span>
              </h1>
              <p className="max-w-2xl mx-auto text-xl md:text-2xl text-slate-200 leading-relaxed font-medium">
                Trouvez facilement des produits et services de qualité, juste à côté de vous. Simple, rapide et local.
              </p>
            </div>
            
            <div className="relative mt-12 bg-white/10 backdrop-blur-xl p-2 rounded-2xl border border-white/20 shadow-2xl" ref={searchContainerRef}>
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

      {/* Modern Features Section */}
      <section className="py-24 bg-white">
        <div className="container px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="space-y-4 p-8 rounded-3xl hover:bg-orange-50/50 transition-colors duration-300">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Sparkles className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-2xl font-black">Qualité Locale</h3>
              <p className="text-muted-foreground leading-relaxed">Nous sélectionnons les meilleures boutiques de votre quartier pour vous garantir satisfaction.</p>
            </div>
            <div className="space-y-4 p-8 rounded-3xl hover:bg-orange-50/50 transition-colors duration-300">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-2xl font-black">Tendances Actuelles</h3>
              <p className="text-muted-foreground leading-relaxed">Découvrez ce qui fait fureur autour de vous en temps réel avec nos algorithmes intelligents.</p>
            </div>
            <div className="space-y-4 p-8 rounded-3xl hover:bg-orange-50/50 transition-colors duration-300">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Star className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-2xl font-black">Confiance Vérifiée</h3>
              <p className="text-muted-foreground leading-relaxed">Chaque boutique et chaque produit est soigneusement vérifié pour votre sécurité.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-orange-50/30">
        <div className="container px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">
              Boutiques <span className="text-orange-500">à la Une</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
              Soutenez les commerçants locaux et découvrez des pépites à deux pas de chez vous.
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

      <section className="py-24 bg-white border-t border-orange-100">
        <div className="container px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">
              Nos derniers <span className="text-orange-500">produits</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
              Les nouveautés les plus fraîches dénichées spécialement pour vous.
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