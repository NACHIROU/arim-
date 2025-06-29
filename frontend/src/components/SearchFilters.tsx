import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import './SearchFilters.css';

interface SearchFiltersProps {
  onSearch: (filters: SearchFilters) => void;
}

interface SearchFilters {
  searchTerm: string;
  category: string;
  priceRange: string;
  location: string;
}

const categories = [
  "Tous",
  "Alimentaire",
  "Vêtements",
  "Électronique",
  "Maison & Jardin",
  "Santé & Beauté",
  "Sport & Loisirs",
  "Automobile",
  "Services",
  "Artisanat"
];

const priceRanges = [
  "Tous les prix",
  "0 - 10 000 FCFA",
  "10 000 - 50 000 FCFA",
  "50 000 - 100 000 FCFA",
  "100 000 - 500 000 FCFA",
  "500 000+ FCFA"
];

const locations = [
  "Toutes les villes",
  "Cotonou",
  "Porto-Novo",
  "Parakou",
  "Abomey-Calavi",
  "Bohicon",
  "Natitingou",
  "Ouidah",
  "Kandi"
];

const SearchFilters: React.FC<SearchFiltersProps> = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('Tous');
  const [priceRange, setPriceRange] = useState('Tous les prix');
  const [location, setLocation] = useState('Toutes les villes');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = () => {
    onSearch({
      searchTerm,
      category,
      priceRange,
      location
    });
  };

  const resetFilters = () => {
    setSearchTerm('');
    setCategory('Tous');
    setPriceRange('Tous les prix');
    setLocation('Toutes les villes');
    onSearch({
      searchTerm: '',
      category: 'Tous',
      priceRange: 'Tous les prix',
      location: 'Toutes les villes'
    });
  };

  return (
    <div className="search-filters-container">
      <div className="main-search">
        <div className="search-input-group">
          <Input
            type="search"
            placeholder="Rechercher un produit, une boutique..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <Button onClick={handleSearch} className="search-button">
            Rechercher
          </Button>
        </div>
        
        <Button 
          onClick={() => setShowFilters(!showFilters)}
          className="filter-toggle"
          variant="outline"
        >
          <Filter className="filter-icon" />
          Filtres
        </Button>
      </div>

      {showFilters && (
        <div className="filters-panel">
          <div className="filters-grid">
            <div className="filter-group">
              <label>Catégorie</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="filter-group">
              <label>Gamme de prix</label>
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priceRanges.map((range) => (
                    <SelectItem key={range} value={range}>
                      {range}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="filter-group">
              <label>Localisation</label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="filter-actions">
            <Button onClick={handleSearch} className="apply-filters">
              Appliquer les filtres
            </Button>
            <Button onClick={resetFilters} variant="outline" className="reset-filters">
              Réinitialiser
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilters;