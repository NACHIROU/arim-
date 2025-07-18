
import React, { useState, useEffect } from 'react';
import ProductCard from "@/components/ProductCard";
import { Loader2, Package, Search, Filter } from 'lucide-react';
import { Produit } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto" />
                    <p className="text-muted-foreground text-lg">Chargement des produits...</p>
                </div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center">
                <Card className="p-8 text-center shadow-lg">
                    <div className="text-red-500 text-xl font-semibold">Erreur : {error}</div>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
            <div className="container py-16 md:py-24">
                {/* Header section */}
                <div className="text-center space-y-6 mb-12">
                    <div className="inline-flex items-center gap-3 bg-orange-100 text-orange-700 px-6 py-3 rounded-full text-sm font-medium">
                        <Package className="h-5 w-5" />
                        Catalogue Produits
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                        Tous nos produits
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        Découvrez notre large sélection de produits issus des meilleures boutiques locales
                    </p>
                </div>

                {/* Search and filter section */}
                <Card className="mb-8 bg-white/80 backdrop-blur-sm border-orange-100 shadow-lg">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-4 items-center">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                                <Input 
                                    placeholder="Rechercher un produit..." 
                                    className="pl-10 bg-white border-orange-200 focus:border-orange-300 focus:ring-orange-200"
                                />
                            </div>
                            <Button variant="outline" className="border-orange-200 hover:border-orange-300 hover:bg-orange-50">
                                <Filter className="h-4 w-4 mr-2" />
                                Filtrer
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Products grid */}
                {products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {products.map((product) => (
                            <ProductCard 
                                key={product._id}
                                product={product}
                                showShopLink
                            />
                        ))}
                    </div>
                ) : (
                    <Card className="text-center py-16 bg-white/80 backdrop-blur-sm border-orange-100 shadow-lg">
                        <CardContent>
                            <Package className="h-16 w-16 text-orange-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">Aucun produit disponible</h3>
                            <p className="text-muted-foreground">Revenez plus tard pour découvrir nos nouveaux produits.</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default Products;
