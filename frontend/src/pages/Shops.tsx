
import React, { useState, useEffect } from 'react';
import PublicBoutiqueCard from '@/components/PublicBoutiqueCard';
import { Loader2, Store, Search, Filter } from 'lucide-react';
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
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto" />
          <p className="text-muted-foreground text-lg">Chargement des boutiques...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center">
        <Card className="p-8 text-center shadow-lg">
          <div className="text-red-500 text-xl font-semibold">Une erreur est survenue : {error}</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <div className="container mx-auto px-4 py-16 md:py-24">
        {/* Header section */}
        <div className="text-center space-y-6 mb-12">
          <div className="inline-flex items-center gap-3 bg-orange-100 text-orange-700 px-6 py-3 rounded-full text-sm font-medium">
            <Store className="h-5 w-5" />
            Répertoire Boutiques
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            Toutes nos boutiques
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Explorez les meilleures boutiques de votre région et découvrez des produits uniques
          </p>
        </div>

        {/* Search and filter section */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm border-orange-100 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input 
                  placeholder="Rechercher une boutique..." 
                  className="pl-10 bg-white border-orange-200 focus:border-orange-300 focus:ring-orange-200"
                />
              </div>
              <Button variant="outline" className="border-orange-200 hover:border-orange-300 hover:bg-orange-50">
                <Filter className="h-4 w-4 mr-2" />
                Filtrer par catégorie
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Boutiques grid */}
        {boutiques.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {boutiques.map((boutique) => (
              <PublicBoutiqueCard key={boutique._id} boutique={boutique} />
            ))}
          </div>
        ) : (
          <Card className="text-center py-16 bg-white/80 backdrop-blur-sm border-orange-100 shadow-lg">
            <CardContent>
              <Store className="h-16 w-16 text-orange-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Aucune boutique disponible</h3>
              <p className="text-muted-foreground">Revenez plus tard pour découvrir de nouvelles boutiques.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Shops;
