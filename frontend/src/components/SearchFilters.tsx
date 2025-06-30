import React from 'react';
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import './SearchFilters.css'; // Assurez-vous d'importer le CSS

interface SearchFiltersProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  placeholder?: string;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ 
  searchTerm, 
  onSearchTermChange,
  placeholder = "Rechercher un produit ou une boutique..."
}) => {
  return (
    <div className="search-filters-container-live">
      <div className="search-input-group">
        <Search className="h-5 w-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
        <Input
          type="search"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          className="search-input-live pl-10" // Padding à gauche pour l'icône
        />
      </div>
    </div>
  );
};

export default SearchFilters;