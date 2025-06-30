import React from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react'; // Pour une icône de chargement

const SearchResultsDropdown = ({ results, isLoading }) => {
  // Affiche un message de chargement
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

  // Affiche un message si aucun résultat n'est trouvé
  if (results.length === 0) {
    return (
      <div className="search-results-dropdown">
        <p className="p-4 text-center text-muted-foreground">Aucun résultat trouvé.</p>
      </div>
    );
  }

  // Affiche les résultats
  return (
    <div className="search-results-dropdown">
      {results.map(item => {
        // Affichage conditionnel selon le type de résultat (shop ou product)
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
                <p className="result-type-product">Dans la boutique {item.data.shop_name}</p>
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