import React, { useState, useEffect, useMemo } from 'react';
import PublicBoutiqueCard from '@/components/PublicBoutiqueCard';
import { Loader2, Store, Search, Filter, MapPin } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Toutes nos Boutiques</h1>
          <p className="text-lg text-muted-foreground">Explorez les commerces locaux partenaires.</p>
        </div>

        <Card className="mb-12 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input 
                  placeholder="Rechercher par nom..." 
                  className="pl-10 h-12 bg-secondary/50 text-black border-0 focus:ring-2 focus:ring-primary rounded-xl"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-12 w-full md:w-[200px] bg-orange-500 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>{categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="h-12 w-full md:w-[200px] bg-orange-500 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>{locations.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {filteredBoutiques.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
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