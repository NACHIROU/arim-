import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import './SearchFilters.css'; // Assurez-vous que le CSS est importé

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

  // useEffect pour informer le parent à chaque changement de filtre, avec un délai
  useEffect(() => {
    const handler = setTimeout(() => {
      onFiltersChange({ searchTerm, category, priceRange, location });
    }, 400); // Délai de 400ms avant de déclencher la recherche

    return () => clearTimeout(handler);
  }, [searchTerm, category, priceRange, location, onFiltersChange]);

  return (
    <div className="search-filters-container">
      <div className="main-search">
        <Input
          type="search"
          placeholder="Rechercher un produit, une boutique..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <Button onClick={() => setShowFilters(!showFilters)} className="filter-toggle" variant="outline">
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
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{categories.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="filter-group">
              <label>Gamme de prix (FCFA)</label>
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{priceRanges.map((range) => <SelectItem key={range} value={range}>{range}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="filter-group">
              <label>Localisation</label>
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