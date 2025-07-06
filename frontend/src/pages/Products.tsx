import React, { useState, useEffect } from 'react';
import ProductCard from "@/components/ProductCard";
import { Loader2 } from 'lucide-react';
import { Produit } from '@/types';

const Products: React.FC = () => {
    const [products, setProducts] = useState<Produit[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAllProducts = async () => {
            try {
                setLoading(true);
                const response = await fetch("http://localhost:8000/products/public-products/");
                if (!response.ok) {
                    throw new Error("Erreur lors de la récupération des produits.");
                }
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

    if (loading) {
        return <div className="container flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }
    if (error) {
        return <div className="container py-24 text-center text-red-500">Erreur : {error}</div>;
    }

    return (
        <div className="container py-16 md:py-24">
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-10">Tous nos produits</h1>
            {products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {products.map((product) => (
                        <ProductCard 
                            key={product._id}
                            id={product._id}
                            name={product.name}
                            shopName={product.shop?.name || 'Boutique inconnue'}
                            price={product.price}
                            // --- CORRECTION ICI ---
                            // On prend la première image du tableau 'images'
                            imageUrl={(product.images && product.images.length > 0) ? product.images[0] : ''}
                            shopId={product.shop?._id}
                            showShopLink
                        />
                    ))}
                </div>
            ) : (
                <p className="text-center text-muted-foreground mt-10">Aucun produit à afficher pour le moment.</p>
            )}
        </div>
    );
};

export default Products;