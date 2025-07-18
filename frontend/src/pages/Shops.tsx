
import React, { useState, useEffect } from 'react';
import PublicBoutiqueCard from '@/components/PublicBoutiqueCard';
import { Loader2, Store, Search, Filter, MapPin, Sparkles } from 'lucide-react';
import { Boutique } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Shops: React.FC = () => {
  const [boutiques, setBoutiques] = useState<Boutique[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublicShops = async () => {
      try {
        const response = await fetch("http://localhost:8000/shops/public-shops/");
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des boutiques.");
        }
        const data = await response.json();
        setBoutiques(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublicShops();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-orange-400 to-amber-400 flex items-center justify-center mx-auto">
              <Loader2 className="h-10 w-10 animate-spin text-white" />
            </div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-400 to-amber-400 animate-pulse opacity-20"></div>
          </div>
          <p className="text-xl font-medium text-gray-600">Chargement des boutiques...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center">
        <Card className="p-8 text-center shadow-xl border-0 bg-white/80 backdrop-blur-sm rounded-3xl">
          <div className="text-red-500 text-xl font-semibold">Une erreur est survenue : {error}</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <div className="container mx-auto px-4 py-16 md:py-24">
        {/* Header moderne */}
        <div className="text-center space-y-8 mb-16">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 px-8 py-4 rounded-full text-sm font-semibold shadow-lg">
            <Store className="h-5 w-5" />
            Répertoire Boutiques
          </div>
        </div>

        {/* Barre de recherche moderne */}
        <Card className="mb-12 bg-white/60 backdrop-blur-xl border-0 shadow-2xl rounded-3xl overflow-hidden">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input 
                  placeholder="Rechercher une boutique..." 
                  className="pl-12 h-14 bg-white/80 border-0 rounded-2xl text-lg font-medium placeholder:text-gray-400 focus:bg-white transition-all duration-300 shadow-lg"
                />
              </div>
              <Button variant="outline" className="h-14 px-8 bg-white/80 border-0 rounded-2xl hover:bg-orange-50 transition-all duration-300 shadow-lg font-semibold">
                <Filter className="h-5 w-5 mr-3" />
                Catégories
              </Button>
              <Button variant="outline" className="h-14 px-8 bg-white/80 border-0 rounded-2xl hover:bg-orange-50 transition-all duration-300 shadow-lg font-semibold">
                <MapPin className="h-5 w-5 mr-3" />
                Localisation
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Grille des boutiques */}
        {boutiques.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {boutiques.map((boutique) => (
              <PublicBoutiqueCard key={boutique._id} boutique={boutique} />
            ))}
          </div>
        ) : (
          <Card className="text-center py-20 bg-white/60 backdrop-blur-xl border-0 shadow-2xl rounded-3xl">
            <CardContent>
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-orange-400 to-amber-400 flex items-center justify-center mx-auto mb-6">
                <Store className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Aucune boutique disponible</h3>
              <p className="text-gray-600 text-lg">Revenez bientôt pour découvrir de nouvelles boutiques !</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Shops;
