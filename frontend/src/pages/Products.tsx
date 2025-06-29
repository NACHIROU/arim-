import React, { useState, useEffect } from 'react';
import ProductCard from "@/components/ProductCard";

// L'interface reste la même, mais on doit gérer le fait que 'shop' peut être null
interface ProductFromAPI {
  id: string;
  name: string;
  price: number;
  image_url: string;
  seller: string;
  shop: { // 'shop' peut potentiellement être null dans la réponse de l'API
    id: string;
    name: string;
  } | null; // On ajoute la possibilité que ce soit null
}

const Products = () => {
    const [products, setProducts] = useState<ProductFromAPI[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAllProducts = async () => {
            try {
                const response = await fetch("http://localhost:8000/products/get-all-products/");
                if (!response.ok) throw new Error("Erreur réseau.");
                
                const data = await response.json();
                setProducts(data);
            } catch (err) {
                const message = err instanceof Error ? err.message : "Une erreur inconnue est survenue.";
                setError(message);
            } finally {
                setLoading(false);
            }
        };
        fetchAllProducts();
    }, []);

    if (loading) return <div className="container py-24 text-center">Chargement des produits...</div>;
    if (error) return <div className="container py-24 text-center text-red-500">Erreur : {error}</div>;

    return (
        <div className="container py-16 md:py-24">
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-10">Tous nos produits</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                
                {products
                  .filter(product => product.shop) 
                  .map((product, index) => (
                    <div key={product.id} className="animate-fade-in-up" style={{ animationDelay: `${0.2 + index * 0.1}s` }}>
                        <ProductCard 
                            id={product.id}
                            name={product.name}
                            seller={product.seller}
                            price={product.price}
                            imageUrl={product.image_url}
                            // À ce stade, on est SÛR que product.shop n'est pas null
                            shopId={product.shop!.id} 
                            showShopLink 
                        />
                    </div>
                ))}
                
            </div>
        </div>
    );
};

export default Products;