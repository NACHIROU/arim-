import React, { useState, useEffect, useMemo } from 'react';
import ProductCard from "@/components/ProductCard";
import { Loader2, Search, Filter, MapPin, DollarSign } from 'lucide-react';
import { Produit } from '@/types';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const categories = [ "Toutes les catégories", "Alimentaire & Boissons", "Vêtements & Mode", "Santé & Beauté", "Électronique & Multimédia", "Maison & Jardin", "Construction & Bâtiment", "Autre" ];
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
            // Filtre par nom
            const searchMatch = searchTerm.length === 0 || product.name.toLowerCase().includes(searchTerm.toLowerCase());
            
            // Filtre par catégorie (avec sécurité)
            const categoryMatch = categoryFilter === 'Toutes les catégories' || product.shop?.category === categoryFilter;
            
            // Filtre par localisation (avec sécurité)
            const locationMatch = locationFilter === 'Toutes les villes' || 
                (product.shop?.location && product.shop.location.toLowerCase().includes(locationFilter.toLowerCase()));

            // Filtre par prix (nouveau)
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
        <div className="min-h-screen bg-slate-50">
            <div className="container mx-auto px-4 py-16">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4">Tous nos Produits</h1>
                    <p className="text-lg text-muted-foreground">Trouvez ce dont vous avez besoin auprès de nos commerçants locaux.</p>
                </div>

                <Card className="mb-12 shadow-lg">
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="relative md:col-span-2 lg:col-span-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
                                <Input 
                                    placeholder="Rechercher par nom..." 
                                    className="pl-10 h-12"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                <SelectTrigger className="h-12"><Filter className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger>
                                <SelectContent>{categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent>
                            </Select>
                            <Select value={locationFilter} onValueChange={setLocationFilter}>
                                <SelectTrigger className="h-12"><MapPin className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger>
                                <SelectContent>{locations.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}</SelectContent>
                            </Select>
                            <Select value={priceFilter} onValueChange={setPriceFilter}>
                                <SelectTrigger className="h-12"><DollarSign className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger>
                                <SelectContent>{priceRanges.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {filteredProducts.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-muted-foreground">
                        <p className="text-lg">Aucun produit ne correspond à vos critères de recherche.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Products;