import React, { useState, useEffect, useMemo } from 'react';
import ProductCard from "@/components/ProductCard";
import { Search, Package, X } from 'lucide-react';
import { Produit } from '@/types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { dataService } from '@/lib/dataService';

const categories = [ "Toutes les catégories", "Alimentaire & Boissons", "Vêtements & Mode", "Santé & Beauté", "Électronique & Multimédia", "Maison & Jardin", "Construction & Bâtiment", "Autre" ];
const locations = ["Toutes les villes", "Cotonou", "Porto-Novo", "Parakou", "Abomey-Calavi"];
const priceRanges = ["Tous les prix", "0-10000", "10000-50000", "50000-100000", "100000+"];

const Products: React.FC = () => {
  const [products, setProducts] = useState<Produit[]>(() => dataService.getInitialProducts());
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Toutes les catégories');
  const [locationFilter, setLocationFilter] = useState('Toutes les villes');
  const [priceFilter, setPriceFilter] = useState('Tous les prix');

  useEffect(() => {
    dataService.syncProducts(setProducts);
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const searchMatch = searchTerm 
        ? product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.description?.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      const categoryMatch = categoryFilter === 'Toutes les catégories' || product.shop?.category === categoryFilter;
      const locationMatch = locationFilter === 'Toutes les villes' || (product.shop?.location && product.shop.location.toLowerCase().includes(locationFilter.toLowerCase()));

      let priceMatch = true;
      if (priceFilter !== 'Tous les prix') {
        if (priceFilter.includes('+')) {
          const min = parseInt(priceFilter.replace('+', ''));
          priceMatch = product.price >= min;
        } else {
          const [min, max] = priceFilter.split('-').map(Number);
          priceMatch = product.price >= min && product.price <= max;
        }
      }
      return searchMatch && categoryMatch && locationMatch && priceMatch;
    });
  }, [products, searchTerm, categoryFilter, locationFilter, priceFilter]);

  const hasFilters = searchTerm || categoryFilter !== 'Toutes les catégories' || locationFilter !== 'Toutes les villes' || priceFilter !== 'Tous les prix';

  const resetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('Toutes les catégories');
    setLocationFilter('Toutes les villes');
    setPriceFilter('Tous les prix');
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-10 sm:py-16">
      <div className="container mx-auto px-4 sm:px-8">
        
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/60 text-orange-600 text-xs font-bold uppercase tracking-wider">
            <Package className="h-3.5 w-3.5" />
            <span>Catalogue complet</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Tous nos <span className="text-orange-500">Produits</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            Découvrez une sélection variée d'articles neufs et authentiques proposés directement par vos commerçants locaux.
          </p>
        </div>

        {/* Toolbar Filtres Moderne */}
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm p-4 sm:p-5 mb-10">
          <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
              <Input 
                placeholder="Rechercher un produit, une référence..." 
                className="pl-11 h-12 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border-slate-200 focus:border-orange-500 rounded-xl text-sm font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-12 w-full sm:w-[170px] bg-slate-50 border-slate-200 rounded-xl text-xs font-semibold text-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200">
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat} className="text-xs font-medium">{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="h-12 w-full sm:w-[160px] bg-slate-50 border-slate-200 rounded-xl text-xs font-semibold text-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200">
                  {locations.map(loc => (
                    <SelectItem key={loc} value={loc} className="text-xs font-medium">{loc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger className="h-12 w-full sm:w-[160px] bg-slate-50 border-slate-200 rounded-xl text-xs font-semibold text-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200">
                  {priceRanges.map(price => (
                    <SelectItem key={price} value={price} className="text-xs font-medium">{price}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {hasFilters && (
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-xs">
              <span className="font-semibold text-slate-500">
                {filteredProducts.length} {filteredProducts.length > 1 ? 'produits trouvés' : 'produit trouvé'}
              </span>
              <button 
                onClick={resetFilters} 
                className="text-orange-600 hover:underline font-semibold flex items-center gap-1"
              >
                <X className="h-3 w-3" />
                Effacer les filtres
              </button>
            </div>
          )}
        </div>

        {/* Grille des produits */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div key={product._id} className="h-full">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white border border-slate-200/80 rounded-2xl p-8 max-w-lg mx-auto">
            <Package className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-base font-bold text-slate-800">Aucun produit ne correspond à vos critères</p>
            <p className="text-xs text-slate-500 mt-1 mb-4">Essayez d'ajuster vos filtres de prix ou de catégorie pour élargir la recherche.</p>
            <button 
              onClick={resetFilters} 
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-semibold"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;