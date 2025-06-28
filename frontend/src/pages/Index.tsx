import ProductCard from "@/components/ProductCard";
import SearchFilters from "@/components/SearchFilters";
import { useState } from "react";
import { products, shops } from "@/data";
import { getUserRole } from "@/utils/jwt";
import { Link } from "react-router-dom";

const Index = () => {
  const [filteredProducts, setFilteredProducts] = useState(products);
  const role = getUserRole();

  const handleSearch = (filters: any) => {
    console.log('Filtres appliqués:', filters);
    setFilteredProducts(products);
  };

  return (
    <>
      {/* Boutons seulement si l'utilisateur n'est pas connecté */}
      {!role && (
        <div className="text-center my-4">
          <Link to="/login" className="mr-4 underline text-blue-600">Se connecter</Link>
          <Link to="/register" className="underline text-blue-600">S'inscrire</Link>
        </div>
      )}

      {/* Hero Section */}
      <section style={{ 
        padding: '5rem 0', 
        backgroundColor: '#f8fafc',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          <h1 style={{ 
            fontSize: '3.5rem', 
            fontWeight: 'bold', 
            marginBottom: '1rem',
            color: '#1f2937'
          }}>
            Trouvez l'objet de vos rêves
          </h1>
          <p style={{ 
            maxWidth: '600px', 
            margin: '0 auto 2rem', 
            fontSize: '1.25rem', 
            color: '#6b7280'
          }}>
            Explorez des milliers d'articles uniques créés par des vendeurs passionnés du monde entier.
          </p>
          
          <SearchFilters onSearch={handleSearch} />
        </div>
      </section>

      {/* Products Section */}
      <section style={{ padding: '4rem 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          <h2 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold', 
            textAlign: 'center', 
            marginBottom: '2.5rem',
            color: '#1f2937'
          }}>
            Notre sélection
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '2rem'
          }}>
            {filteredProducts.map((product) => {
              const shop = shops.find(s => s.name === product.seller);
              return (
                <div key={product.id}>
                  <ProductCard {...product} shopId={shop?.id} showShopLink />
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
};

export default Index;
