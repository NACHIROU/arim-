import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, Pencil, Trash2, Search } from "lucide-react";
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg">
        <h3 className="text-xl font-semibold text-foreground">
          Mes produits ({filteredProduits.length})
        </h3>
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un produit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full sm:w-80 border-0 bg-muted/50 focus:ring-2 focus:ring-primary/20 rounded-xl h-12"
          />
        </div>
      </div>

      {filteredProduits.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProduits.map((produit) => (
            <Card key={produit._id} className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white/90 backdrop-blur-sm">
              <div className="aspect-square bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center rounded-t-lg relative overflow-hidden">
                {produit.images && produit.images.length > 0 ? (
                  <img 
                    src={produit.images[0]} 
                    alt={produit.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                ) : (
                  <Package className="h-16 w-16 text-primary opacity-50" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              
              <CardContent className="p-4 space-y-2">
                <h4 className="font-semibold text-lg text-foreground truncate group-hover:text-primary transition-colors duration-300">
                  {produit.name}
                </h4>
                <div className="bg-orange-600 text-white px-3 py-1 rounded-full inline-block">
                  <p className="font-bold text-sm">{produit.price.toLocaleString('fr-FR')} FCFA</p>
                </div>
              </CardContent>
              
              <CardFooter className="p-3 flex justify-end gap-2 bg-gradient-to-r from-orange-50 to-yellow-50 border-t border-orange-100">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => onEdit(produit)}
                  className="hover:bg-orange-100 text-primary hover:text-primary transition-all duration-300"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => onDelete(produit._id)}
                  className="hover:bg-red-100 text-red-600 hover:text-red-700 transition-all duration-300"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl border-2 border-dashed border-orange-200">
          <Package className="h-16 w-16 text-primary mx-auto mb-4 opacity-50" />
          <p className="text-lg text-muted-foreground">
            {searchTerm ? 'Aucun produit trouvé pour cette recherche.' : 'Aucun produit trouvé pour cette boutique.'}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Utilisez le formulaire ci-dessus pour ajouter votre premier produit !
          </p>
        </div>
      )}
    </div>
  );
};

export default ProduitsList;