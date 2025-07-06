import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, Pencil, Trash2 } from "lucide-react";
import { Produit } from '@/types';

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

  return (
    <div className="produits-list mt-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Mes produits ({filteredProduits.length})</h3>
        <Input
          placeholder="Rechercher un produit..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {filteredProduits.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredProduits.map((produit) => (
            <Card key={produit._id} className="flex flex-col justify-between">
              <div>
                <div className="aspect-video bg-secondary flex items-center justify-center rounded-t-lg">
                  {/* --- CORRECTION : On utilise le tableau 'images' --- */}
                  {produit.images && produit.images.length > 0 ? (
                    <img src={produit.images[0]} alt={produit.name} className="aspect-video object-cover w-full h-full rounded-t-lg" />
                  ) : (
                    <Package className="h-10 w-10 text-muted-foreground" />
                  )}
                </div>
                <CardContent className="p-3">
                  <h4 className="font-semibold truncate">{produit.name}</h4>
                  <p className="text-primary font-bold text-lg">{produit.price.toLocaleString('fr-FR')} FCFA</p>
                </CardContent>
              </div>
              <CardFooter className="p-2 flex justify-end gap-2 bg-slate-50 border-t">
                <Button type="button" variant="ghost" size="icon" onClick={() => onEdit(produit)}>
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
          <p>Aucun produit trouvé pour cette boutique ou ce filtre.</p>
        </div>
      )}
    </div>
  );
};

export default ProduitsList;