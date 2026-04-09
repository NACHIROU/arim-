import React, { useState, useEffect, useMemo } from 'react';
import PublicBoutiqueCard from '@/components/PublicBoutiqueCard';
import { Loader2, Search } from 'lucide-react';
import { Boutique } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const categories = [ "Toutes les catégories", "Alimentaire & Boissons", "Vêtements & Mode", "Santé & Beauté", "Électronique & Multimédia", "Maison & Jardin", "Construction & Bâtiment", "Autre" ];
const locations = ["Toutes les villes", "Cotonou", "Porto-Novo", "Parakou", "Abomey-Calavi"];

const Shops: React.FC = () => {
  const [boutiques, setBoutiques] = useState<Boutique[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Toutes les catégories');
  const [locationFilter, setLocationFilter] = useState('Toutes les villes');

  useEffect(() => {
    const fetchPublicShops = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/shops/public-shops/`);
        if (!response.ok) throw new Error("Erreur de récupération des boutiques.");
        setBoutiques(await response.json());
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPublicShops();
  }, []);

  const filteredBoutiques = useMemo(() => {
    return boutiques.filter(boutique => {
      const searchMatch = searchTerm.length === 0 || boutique.name.toLowerCase().includes(searchTerm.toLowerCase());
      const categoryMatch = categoryFilter === 'Toutes les catégories' || boutique.category === categoryFilter;
      const locationMatch = locationFilter === 'Toutes les villes' || boutique.location.toLowerCase().includes(locationFilter.toLowerCase());
      
      return searchMatch && categoryMatch && locationMatch;
    });
  }, [boutiques, searchTerm, categoryFilter, locationFilter]);

  if (isLoading) return <div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  if (error) return <div className="text-center py-24 text-red-500">Erreur : {error}</div>;

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16 sm:py-24">
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 tracking-tight">Toutes nos <span className="text-orange-500">Boutiques</span></h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">Explorez les meilleurs commerces locaux, sélectionnés pour leur qualité et leur proximité.</p>
        </div>

        <Card className="mb-16 shadow-2xl border-0 rounded-[2rem] bg-orange-50/50 backdrop-blur-sm">
          <CardContent className="p-6 md:p-10">
            <div className="flex flex-col lg:flex-row gap-6 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500 h-6 w-6" />
                <Input 
                  placeholder="Quelle boutique cherchez-vous ?" 
                  className="pl-12 h-14 bg-white border-0 focus:ring-2 focus:ring-orange-500 rounded-2xl shadow-sm text-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="h-14 w-full sm:w-[220px] bg-white border-0 shadow-sm rounded-2xl font-bold text-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-0 shadow-xl">
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat} className="font-medium">{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger className="h-14 w-full sm:w-[220px] bg-white border-0 shadow-sm rounded-2xl font-bold text-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-0 shadow-xl">
                    {locations.map(loc => (
                      <SelectItem key={loc} value={loc} className="font-medium">{loc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {filteredBoutiques.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {filteredBoutiques.map((boutique) => (
              <PublicBoutiqueCard key={boutique._id} boutique={boutique} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg">Aucune boutique ne correspond à vos critères de recherche.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shops;