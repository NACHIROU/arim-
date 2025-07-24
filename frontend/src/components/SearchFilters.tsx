import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Filter, Search, MapPin, Tag, DollarSign } from "lucide-react";
import './SearchFilters.css';

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
    }, 400);

    return () => clearTimeout(handler);
  }, [searchTerm, category, priceRange, location, onFiltersChange]);

  return (
    <div className="search-filters-container p-6 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20">
      <div className="main-search flex gap-3">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher un produit, une boutique..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input pl-12 h-14 text-black bg-gray-100 border-0 focus:ring-2 focus:ring-primary rounded-xl"
            aria-label="Rechercher un produit ou une boutique"
          />
        </div>
        <Button 
          onClick={() => setShowFilters(!showFilters)} 
          className="filter-toggle h-14 px-6 bg-orange-500 hover:bg-orange-400 rounded-xl shadow-lg transition-all transform hover:scale-105" 
          variant="default"
        >
          <Filter className="filter-icon h-5 w-5 mr-2" />
          <span className="hidden sm:inline font-semibold">Filtres</span>
        </Button>
      </div>

      {showFilters && (
        <div className="filters-panel mt-6 p-6 bg-gradient-to-r from-secondary/30 to-accent/20 rounded-xl">
          <div className="filters-grid grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="filter-group space-y-3">
              <label className="flex items-center gap-2 text-foreground font-semibold">
                <Tag className="h-4 w-4 text-primary" />
                Catégorie
              </label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-12 bg-white/80 border-0 rounded-lg shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat} className="py-3">
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="filter-group space-y-3">
              <label className="flex items-center gap-2 text-foreground font-semibold">
                <DollarSign className="h-4 w-4 text-primary" />
                Gamme de prix (FCFA)
              </label>
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="h-12 bg-white/80 border-0 rounded-lg shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priceRanges.map((range) => (
                    <SelectItem key={range} value={range} className="py-3">
                      {range}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="filter-group space-y-3">
              <label className="flex items-center gap-2 text-foreground font-semibold">
                <MapPin className="h-4 w-4 text-primary" />
                Villes
              </label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className="h-12 bg-white/80 border-0 rounded-lg shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((loc) => (
                    <SelectItem key={loc} value={loc} className="py-3">
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilters;