import React from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Package, Store } from 'lucide-react';

// Interfaces pour la clarté et la sécurité des types
interface ResultData {
  id: string;
  name: string;
  images?: string[];
  image_url?: string;
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
}

const SearchResultsDropdown: React.FC<SearchResultsDropdownProps> = ({ results, isLoading }) => {
  if (isLoading) {
    return (
      <div className="search-results-dropdown">
        <div className="p-4 text-center flex items-center justify-center text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Recherche en cours...
        </div>
      </div>
    );
  }
  if (!results || results.length === 0) {
    return (
      <div className="search-results-dropdown">
        <p className="p-4 text-center text-muted-foreground">Aucun résultat trouvé.</p>
      </div>
    );
  }

  return (
    <div className="search-results-dropdown">
      {results.map(item => {
        const distanceInKm = item.data.distance ? (item.data.distance / 1000).toFixed(1) : null;

        if (item.type === 'shop') {
          return (
            <Link to={`/shops/${item.data.id}`} key={`shop-${item.data.id}`} className="result-item">
              <img src={item.data.images?.[0] || 'https://via.placeholder.com/40?text=S'} alt={item.data.name} />
              <div className="result-info">
                <h4 className='text-black-900'>{item.data.name}</h4>
                <p className="result-type-shop flex items-center gap-1">
                  <Store className="h-3 w-3" /> Boutique
                  {/* AFFICHAGE DE LA DISTANCE */}
                  {distanceInKm && <span className="text-gray-400 font-normal ml-2"> (à {distanceInKm} km)</span>}
                </p>
              </div>
            </Link>
          );
        }
        if (item.type === 'product') {
          return (
            <Link to={`/products/${item.data.id}`} key={`product-${item.data.id}`} className="result-item">
              <img src={item.data.image_url || 'https://via.placeholder.com/40?text=P'} alt={item.data.name} />
              <div className="result-info">
                <h4 className='text-black-900'>{item.data.name}</h4>
                <p className="result-type-product flex items-center gap-1">
                  <Package className="h-3 w-3 text-orange" /> {item.data.shop_name}
                  {/* AFFICHAGE DE LA DISTANCE */}
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