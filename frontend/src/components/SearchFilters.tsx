import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
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
    <div className="search-filters-container p-4 sm:p-6 bg-white rounded-lg shadow-md">
      <div className="main-search flex gap-2 sm:gap-4">
        <Input
          type="search"
          placeholder="Rechercher un produit, une boutique..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input flex-grow text-black"
          aria-label="Rechercher un produit ou une boutique"
        />
        <Button onClick={() => setShowFilters(!showFilters)} className="filter-toggle" variant="outline">
          <Filter className="filter-icon h-4 w-4" />
          <span className="hidden sm:inline">Filtres</span>
        </Button>
      </div>

      {showFilters && (
        <div className="filters-panel">
          <div className="filters-grid">
            <div className="filter-group">
              <label className="text-black font-medium">Catégorie</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{categories.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="filter-group">
              <label className="text-black font-medium">Gamme de prix (FCFA)</label>
              <Select  value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{priceRanges.map((range) => <SelectItem key={range} value={range}>{range}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="filter-group">
              <label className="text-black font-medium">Villes</label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{locations.map((loc) => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilters;