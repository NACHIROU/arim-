import React from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Package, Store } from 'lucide-react';

// --- On nettoie l'interface pour qu'elle soit cohérente ---
interface ResultData {
  id: string;
  name: string;
  images?: string[]; // On utilise 'images' (un tableau) pour les boutiques ET les produits
  shop_name?: string;
  distance?: number;
}

interface ResultItem {
  type: 'product' | 'shop';
  data: ResultData;
}

interface SearchResultsDropdownProps {
  results: ResultItem[];
  isLoading: boolean;
  onResultClick: () => void;
}

const SearchResultsDropdown: React.FC<SearchResultsDropdownProps> = ({ results, isLoading, onResultClick }) => {
  if (isLoading) {
    return (
      <div className="search-results-dropdown">
        <div className="p-4 text-center flex items-center justify-center text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Recherche...
        </div>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return null;
  }

  return (
    <div className="search-results-dropdown">
      {results.map(item => {
        const distanceInKm = item.data.distance ? (item.data.distance / 1000).toFixed(1) : null;
        
        // On détermine l'image à afficher (la première du tableau)
        const imageUrl = (item.data.images && item.data.images.length > 0) 
          ? item.data.images[0] 
          : `https://via.placeholder.com/40?text=${item.data.name.charAt(0)}`;

        if (item.type === 'shop') {
          return (
            <Link to={`/shops/${item.data.id}`} key={`shop-${item.data.id}`} className="result-item" onClick={onResultClick}>
              <img src={imageUrl} alt={item.data.name} />
              <div className="result-info">
                <h4 className="font-semibold text-orange-600">{item.data.name}</h4>
                <p className="result-type-shop">
                  <Store className="h-3 w-3 inline-block mr-1" /> Boutique
                  {distanceInKm && <span className="text-gray-400 font-normal ml-2"> (à {distanceInKm} km)</span>}
                </p>
              </div>
            </Link>
          );
        }
        
        if (item.type === 'product') {
          return (
            <Link to={`/products/${item.data.id}`} key={`product-${item.data.id}`} className="result-item" onClick={onResultClick}>
              {/* --- CORRECTION ICI --- */}
              {/* On utilise la même logique d'image que pour les boutiques */}
              <img src={imageUrl} alt={item.data.name} />
              <div className="result-info">
                <h4 className="font-semibold text-gray-900">{item.data.name}</h4>
                <p className="result-type-product">
                  <Package className="h-3 w-3 inline-block mr-1" /> {item.data.shop_name}
                  {distanceInKm && <span className="text-gray-400 font-normal ml-2">(à {distanceInKm} km)</span>}
                </p>
              </div>
            </Link>
          );
        }
        
        return null;
      })}
    </div>
  );
};

export default SearchResultsDropdown;