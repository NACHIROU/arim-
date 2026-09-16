import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PublicBoutiqueCard from '@/components/PublicBoutiqueCard';
import ProductCard from "@/components/ProductCard";
import { Button } from '@/components/ui/button';
import SearchFilters, { FiltersState } from '@/components/SearchFilters';
import SearchResultsDropdown from '@/components/SearchResultsDropdown';
import { Sparkles, TrendingUp, ShieldCheck, ArrowRight, Store, Package } from 'lucide-react';
import { Boutique, Produit } from '@/types';
import { useClickOutside } from '@/hooks/useClickOutside';
import { dataService } from '@/lib/dataService';
import heroImage from '@/assets/images/hero-header.jpg';

const Index: React.FC = () => {
  // Chargement instantané sans blocage
  const [shops, setShops] = useState<Boutique[]>(() => dataService.getInitialShops());
  const [products, setProducts] = useState<Produit[]>(() => dataService.getInitialProducts());
  
  const [filters, setFilters] = useState<FiltersState | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  // Logique pour fermer le dropdown
  const closeDropdown = () => {
    setIsDropdownVisible(false);
  };
  const searchContainerRef = useClickOutside(closeDropdown);

  // Synchronisation avec l'API Render en arrière-plan (sans bloquer l'affichage)
  useEffect(() => {
    dataService.syncShops(setShops);
    dataService.syncProducts(setProducts);
  }, []);

  // Déclencheur de recherche
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
        const baseUrl = import.meta.env.VITE_API_BASE_URL;
        if (!baseUrl) throw new Error("No API URL");
        
        const response = await fetch(`${baseUrl}/search/?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data);
          return;
        }
      } catch (searchError) {
        // Recherche locale instantanée de fallback si Render dort
        const query = (filters.searchTerm || '').toLowerCase();
        const localProdResults = products
          .filter(p => !query || p.name.toLowerCase().includes(query))
          .slice(0, 5)
          .map(p => ({
            type: 'product' as const,
            data: { id: p._id, name: p.name, images: p.images, shop_name: p.shop?.name }
          }));

        const localShopResults = shops
          .filter(s => !query || s.name.toLowerCase().includes(query))
          .slice(0, 3)
          .map(s => ({
            type: 'shop' as const,
            data: { id: s._id, name: s.name, images: s.images }
          }));

        setSearchResults([...localProdResults, ...localShopResults]);
      } finally {
        setIsSearching(false);
      }
    };

    executeSearch();
  }, [filters, products, shops]);

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Hero Section Moderne & Nette */}
      <section 
        className="relative text-center py-20 md:py-28 text-white bg-slate-900 bg-cover bg-center overflow-hidden"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-slate-950/70"></div>
        <div className="relative z-10 container px-4 sm:px-6">
          <div className="max-w-3xl mx-auto space-y-6">
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight text-white">
              Pourquoi chercher loin ce qui est tout près ?
            </h1>
            
            <p className="max-w-xl mx-auto text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
              Découvrez les commerçants de votre quartier, achetez en toute confiance et soutenez l'économie locale.
            </p>
            
            <div className="relative mt-8 max-w-2xl mx-auto" ref={searchContainerRef}>
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
      <section className="py-16 bg-white border-b border-slate-200/70">
        <div className="container px-4 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl border border-slate-200/80 bg-slate-50/40 hover:bg-white hover:border-slate-300 transition-all duration-200 shadow-sm">
              <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-600 mb-4">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Commerces Sélectionnés</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Des boutiques authentiques et vérifiées à proximité immédiate pour des achats en toute sérénité.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200/80 bg-slate-50/40 hover:bg-white hover:border-slate-300 transition-all duration-200 shadow-sm">
              <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-600 mb-4">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Tendances Locales</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Accédez aux nouveautés, aux meilleures offres et aux créations phares de votre ville.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200/80 bg-slate-50/40 hover:bg-white hover:border-slate-300 transition-all duration-200 shadow-sm">
              <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-600 mb-4">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Contact Direct & Facile</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Appelez ou échangez directement sur WhatsApp avec vos vendeurs sans intermédiaire superflu.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Boutiques à la Une */}
      <section className="py-16 sm:py-20 bg-slate-50/60">
        <div className="container px-4 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">
                <Store className="h-4 w-4" />
                <span>Nos Partenaires</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Boutiques <span className="text-orange-500">à la une</span>
              </h2>
            </div>
            <Link to="/shops" className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors">
              <span>Voir toutes les boutiques</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {shops.slice(0, 4).map((shop) => (
              <div key={shop._id} className="h-full">
                <PublicBoutiqueCard boutique={shop} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Derniers Produits */}
      <section className="py-16 sm:py-20 bg-white border-t border-slate-200/70">
        <div className="container px-4 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">
                <Package className="h-4 w-4" />
                <span>Sélection Spéciale</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Derniers <span className="text-orange-500">produits ajoutés</span>
              </h2>
            </div>
            <Link to="/products" className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors">
              <span>Voir tout le catalogue</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 8).map((product) => (
              <div key={product._id} className="h-full">
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl px-8 h-12 shadow-sm transition-all">
              <Link to="/products" className="flex items-center gap-2">
                <span>Explorer tous les articles</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;