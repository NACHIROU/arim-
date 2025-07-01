import React from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const SearchResultsDropdown = ({ results, isLoading }) => {
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
        // Affichage conditionnel selon le type de résultat
        if (item.type === 'shop') {
          return (
            <Link to={`/shops/${item.data.id}`} key={`shop-${item.data.id}`} className="result-item">
              <img src={item.data.images?.[0] || '/default-shop.jpg'} alt={item.data.name} />
              <div className="result-info">
                <h4>{item.data.name}</h4>
                <p className="result-type-shop">[Boutique]</p>
              </div>
            </Link>
          );
        }
        if (item.type === 'product' && item.data.shop_id) {
          return (
            <Link to={`/products/${item.data.id}`} key={`product-${item.data.id}`} className="result-item">
              <img src={item.data.image_url || '/default-product.jpg'} alt={item.data.name} />
              <div className="result-info">
                <h4>{item.data.name}</h4>
                <p className="result-type-product">Vendu par {item.data.shop_name}</p>
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