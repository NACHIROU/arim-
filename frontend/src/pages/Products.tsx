import React, { useState, useEffect, useMemo } from 'react';
import ProductCard from "@/components/ProductCard";
import { Loader2, Search } from 'lucide-react';
import { Produit } from '@/types';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const categories = [ "Toutes les catégories", "Alimentaire & Boissons", "Vêtements & Mode", "Construction & Bâtiment", "Autre" ];
const locations = ["Toutes les villes", "Cotonou", "Porto-Novo", "Parakou", "Abomey-Calavi"];
const priceRanges = ["Tous les prix", "0-5000", "5001-15000", "15001-50000", "50001+"];

const Products: React.FC = () => {
    const [products, setProducts] = useState<Produit[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('Toutes les catégories');
    const [locationFilter, setLocationFilter] = useState('Toutes les villes');
    const [priceFilter, setPriceFilter] = useState('Tous les prix');

    useEffect(() => {
        const fetchAllProducts = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/products/public-products/`);
                if (!response.ok) throw new Error("Erreur lors de la récupération des produits.");
                setProducts(await response.json());
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAllProducts();
    }, []);

    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const searchMatch = searchTerm ? product.name.toLowerCase().includes(searchTerm.toLowerCase()) : true;
            const categoryMatch = categoryFilter === 'Toutes les catégories' || product.shop?.category === categoryFilter;
            const locationMatch = locationFilter === 'Toutes les villes' || (product.shop?.location && product.shop.location.toLowerCase().includes(locationFilter.toLowerCase()));

            let priceMatch = true;
            if (priceFilter !== 'Tous les prix') {
                if (priceFilter.includes('+')) {
                    const min = parseInt(priceFilter.replace('+', ''));
                    priceMatch = product.price >= min;
                } else {
                    const [min, max] = priceFilter.split('-').map(Number);
                    priceMatch = product.price >= min && product.price <= max;
                }
            }
            return searchMatch && categoryMatch && locationMatch && priceMatch;
        });
    }, [products, searchTerm, categoryFilter, locationFilter, priceFilter]);

    if (isLoading) return <div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
    if (error) return <div className="text-center py-24 text-red-500">Erreur : {error}</div>;

    return (
        <div className="min-h-screen bg-white">
            <div className="container mx-auto px-4 py-16 sm:py-24">
                <div className="text-center mb-16 space-y-4">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 tracking-tight">Tous nos <span className="text-orange-500">Produits</span></h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">Découvrez une sélection unique d'articles choisis pour vous par nos commerçants partenaires.</p>
                </div>

                <Card className="mb-16 shadow-2xl border-0 rounded-[2rem] bg-orange-50/50 backdrop-blur-sm">
                    <CardContent className="p-6 md:p-10">
                        <div className="flex flex-col lg:flex-row gap-6 items-center">
                            <div className="relative flex-1 w-full">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500 h-6 w-6" />
                                <Input 
                                    placeholder="Que recherchez-vous aujourd'hui ?" 
                                    className="pl-12 h-14 bg-white border-0 focus:ring-2 focus:ring-orange-500 rounded-2xl shadow-sm text-lg"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full lg:w-auto">
                                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                    <SelectTrigger className="h-14 w-full sm:w-[180px] bg-white border-0 shadow-sm rounded-2xl font-bold text-gray-700">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-0 shadow-xl">
                                        {categories.map(cat => (
                                            <SelectItem key={cat} value={cat} className="font-medium">{cat}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select value={locationFilter} onValueChange={setLocationFilter}>
                                    <SelectTrigger className="h-14 w-full sm:w-[180px] bg-white border-0 shadow-sm rounded-2xl font-bold text-gray-700">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-0 shadow-xl">
                                        {locations.map(loc => (
                                            <SelectItem key={loc} value={loc} className="font-medium">{loc}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select value={priceFilter} onValueChange={setPriceFilter}>
                                    <SelectTrigger className="h-14 w-full sm:w-[180px] bg-white border-0 shadow-sm rounded-2xl font-bold text-gray-700">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-0 shadow-xl">
                                        {priceRanges.map(price => (
                                            <SelectItem key={price} value={price} className="font-medium">{price}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
                        {filteredProducts.map((product) => <ProductCard key={product._id} product={product} />)}
                    </div>
                ) : (
                    <div className="text-center py-20 text-muted-foreground">
                        <p className="text-lg">Aucun produit ne correspond à vos critères.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Products;