import React, { useState, useEffect } from 'react';
import PublicBoutiqueCard from '@/components/PublicBoutiqueCard'; // Le composant d'affichage
import { Loader2 } from 'lucide-react';
import { Boutique } from '@/types'; 
// Interface pour typer les données d'une boutique


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
  }, []); // Le tableau vide [] assure que l'effet ne s'exécute qu'une fois

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-10">
        <p>Une erreur est survenue : {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Toutes nos boutiques</h1>
      {boutiques.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {boutiques.map((boutique) => (
            <PublicBoutiqueCard key={boutique._id} boutique={boutique} />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground">Aucune boutique à afficher pour le moment.</p>
      )}
    </div>
  );
};

export default Shops;