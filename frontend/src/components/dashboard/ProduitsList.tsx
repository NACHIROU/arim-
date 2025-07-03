import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Pencil, Trash2 } from "lucide-react";
// Il est possible que SearchBar n'existe plus, à vérifier.
// import SearchBar from './SearchBar'; 
import { Input } from '@/components/ui/input'; // On peut utiliser l'Input de shadcn
import { Produit } from '@/types'; // <-- 1. ON IMPORTE LE BON TYPE

// 2. ON SUPPRIME L'ANCIENNE INTERFACE LOCALE
/*
interface Produit {
  id: string;
  name: string;
  // ...
}
*/

interface ProduitsListProps {
  produits: Produit[];
  onEdit: (produit: Produit) => void;
  onDelete: (id: string) => void;
}

const ProduitsList: React.FC<ProduitsListProps> = ({ produits = [], onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProduits = useMemo(() => {
    if (!searchTerm) return produits;
    return produits.filter(produit =>
      produit.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [produits, searchTerm]);

  if (!Array.isArray(produits)) {
    return <div>Erreur de chargement des produits.</div>;
  }

  return (
    <div className="produits-list mt-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Mes produits ({filteredProduits.length})</h3>
        <Input
          placeholder="Rechercher un produit..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {filteredProduits.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredProduits.map((produit) => (
            // --- 3. ON UTILISE _id PARTOUT ---
            <Card key={produit._id} className="produit-card flex flex-col justify-between">
              <div className="produit-image">
                {produit.image_url ? (
                  <img src={produit.image_url} alt={produit.name} className="aspect-video object-cover" />
                ) : (
                  <div className="placeholder-image h-32 bg-secondary flex items-center justify-center">
                    <Package className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>

              <CardContent className="produit-info p-3">
                <h4 className="font-semibold truncate">{produit.name}</h4>
                <p className="produit-prix text-lg font-bold">{produit.price.toLocaleString('fr-FR')} FCFA</p>
              </CardContent>

              <CardFooter className="produit-actions p-2 flex justify-end gap-2">
                <Button type="button" variant="outline" size="icon" onClick={() => onEdit(produit)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button type="button" variant="destructive" size="icon" onClick={() => onDelete(produit._id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground py-10 border-2 border-dashed rounded-lg">
          <p>Aucun produit trouvé.</p>
        </div>
      )}
    </div>
  );
};

export default ProduitsList;