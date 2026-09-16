import React, { useState, useEffect, useMemo } from 'react';
import PublicBoutiqueCard from '@/components/PublicBoutiqueCard';
import { Search, Store, X } from 'lucide-react';
import { Boutique } from '@/types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { dataService } from '@/lib/dataService';

const categories = [ "Toutes les catégories", "Alimentaire & Boissons", "Vêtements & Mode", "Santé & Beauté", "Électronique & Multimédia", "Maison & Jardin", "Construction & Bâtiment", "Autre" ];
const locations = ["Toutes les villes", "Cotonou", "Porto-Novo", "Parakou", "Abomey-Calavi"];

const Shops: React.FC = () => {
  const [boutiques, setBoutiques] = useState<Boutique[]>(() => dataService.getInitialShops());
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Toutes les catégories');
  const [locationFilter, setLocationFilter] = useState('Toutes les villes');

  useEffect(() => {
    dataService.syncShops(setBoutiques);
  }, []);

  const filteredBoutiques = useMemo(() => {
    return boutiques.filter(boutique => {
      const searchMatch = searchTerm.length === 0 || boutique.name.toLowerCase().includes(searchTerm.toLowerCase()) || boutique.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const categoryMatch = categoryFilter === 'Toutes les catégories' || boutique.category === categoryFilter;
      const locationMatch = locationFilter === 'Toutes les villes' || (boutique.location && boutique.location.toLowerCase().includes(locationFilter.toLowerCase()));
      
      return searchMatch && categoryMatch && locationMatch;
    });
  }, [boutiques, searchTerm, categoryFilter, locationFilter]);

  const hasFilters = searchTerm || categoryFilter !== 'Toutes les catégories' || locationFilter !== 'Toutes les villes';

  const resetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('Toutes les catégories');
    setLocationFilter('Toutes les villes');
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-10 sm:py-16">
      <div className="container mx-auto px-4 sm:px-8">
        
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/60 text-orange-600 text-xs font-bold uppercase tracking-wider">
            <Store className="h-3.5 w-3.5" />
            <span>Commerces de proximité</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Toutes les <span className="text-orange-500">Boutiques</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            Explorez les meilleures adresses locales et découvrez les talents et artisans de votre région.
          </p>
        </div>

        {/* Toolbar Filtres Moderne */}
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm p-4 sm:p-5 mb-10">
          <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
              <Input 
                placeholder="Rechercher une boutique par nom ou mot-clé..." 
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

            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-12 w-full sm:w-[220px] bg-slate-50 border-slate-200 rounded-xl text-xs font-semibold text-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200">
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat} className="text-xs font-medium">{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="h-12 w-full sm:w-[200px] bg-slate-50 border-slate-200 rounded-xl text-xs font-semibold text-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200">
                  {locations.map(loc => (
                    <SelectItem key={loc} value={loc} className="text-xs font-medium">{loc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {hasFilters && (
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-xs">
              <span className="font-semibold text-slate-500">
                {filteredBoutiques.length} {filteredBoutiques.length > 1 ? 'boutiques trouvées' : 'boutique trouvée'}
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

        {/* Grille des boutiques */}
        {filteredBoutiques.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBoutiques.map((boutique) => (
              <div key={boutique._id} className="h-full">
                <PublicBoutiqueCard boutique={boutique} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white border border-slate-200/80 rounded-2xl p-8 max-w-lg mx-auto">
            <Store className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-base font-bold text-slate-800">Aucune boutique trouvée</p>
            <p className="text-xs text-slate-500 mt-1 mb-4">Essayez d'ajuster vos filtres de recherche pour voir plus de résultats.</p>
            <button 
              onClick={resetFilters} 
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-semibold"
            >
              Réinitialiser les critères
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shops;