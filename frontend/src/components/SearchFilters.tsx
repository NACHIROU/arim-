import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Filter, Search, MapPin, Tag, DollarSign, X } from "lucide-react";

export interface FiltersState {
  searchTerm: string;
  category: string;
  priceRange: string;
  location: string;
}

interface SearchFiltersProps {
  onFiltersChange: (filters: FiltersState) => void;
}

const categories = [ "Tous", "Alimentaire & Boissons", "Vêtements & Mode", "Santé & Beauté", "Électronique & Multimédia", "Maison & Jardin", "Quincaillerie", "Sport & Loisirs", "Restauration & Hôtellerie", "Services à la personne", "Construction & Bâtiment", "Automobile", "Éducation & Formation", "Artisanat", "Divers", "Autres" ];
const priceRanges = ["Tous les prix", "0-10000", "10000-50000", "50000-100000", "100000+"];
const locations = ["Toutes les villes", "Cotonou", "Porto-Novo", "Parakou", "Abomey-Calavi"];

const SearchFilters: React.FC<SearchFiltersProps> = ({ onFiltersChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('Tous');
  const [priceRange, setPriceRange] = useState('Tous les prix');
  const [location, setLocation] = useState('Toutes les villes');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      onFiltersChange({ searchTerm, category, priceRange, location });
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm, category, priceRange, location, onFiltersChange]);

  const hasActiveFilters = category !== 'Tous' || priceRange !== 'Tous les prix' || location !== 'Toutes les villes';

  const resetFilters = () => {
    setCategory('Tous');
    setPriceRange('Tous les prix');
    setLocation('Toutes les villes');
  };

  return (
    <div className="w-full bg-white border border-slate-200/90 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.06)] p-3 sm:p-4 transition-all">
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
        <div className="relative flex-grow">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            type="search"
            placeholder="Rechercher un produit, une marque, une boutique locale..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-11 h-12 text-slate-900 placeholder:text-slate-400 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl text-sm font-medium transition-all"
            aria-label="Rechercher un produit ou une boutique"
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

        <Button 
          type="button"
          onClick={() => setShowFilters(!showFilters)} 
          variant={showFilters || hasActiveFilters ? "default" : "outline"}
          className={`h-12 px-5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
            showFilters || hasActiveFilters 
              ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-sm' 
              : 'border-slate-200 text-slate-700 hover:bg-slate-50'
          }`} 
        >
          <Filter className="h-4 w-4" />
          <span>Filtres</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-white ml-0.5 animate-pulse" />
          )}
        </Button>
      </div>

      {showFilters && (
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 text-orange-500" />
              Catégorie
            </label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-10 bg-slate-50 border-slate-200 text-slate-800 text-xs font-medium rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-60 rounded-xl border-slate-200">
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat} className="text-xs">
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5 text-orange-500" />
              Prix (FCFA)
            </label>
            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger className="h-10 bg-slate-50 border-slate-200 text-slate-800 text-xs font-medium rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200">
                {priceRanges.map((range) => (
                  <SelectItem key={range} value={range} className="text-xs">
                    {range}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-orange-500" />
              Localisation
            </label>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="h-10 bg-slate-50 border-slate-200 text-slate-800 text-xs font-medium rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200">
                {locations.map((loc) => (
                  <SelectItem key={loc} value={loc} className="text-xs">
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters && (
            <div className="sm:col-span-3 flex justify-end pt-1">
              <button
                onClick={resetFilters}
                className="text-xs font-semibold text-slate-400 hover:text-orange-600 transition-colors flex items-center gap-1"
              >
                <X className="h-3 w-3" />
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchFilters;