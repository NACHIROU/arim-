import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Pencil, Trash2 } from "lucide-react";
import SearchBar from './SearchBar';

interface ProduitsListProps {
  produits: any[];
  onEdit: (produit: any) => void;
  onDelete: (id: number) => void;
}

const ProduitsList: React.FC<ProduitsListProps> = ({ produits, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProduits = useMemo(() => {
    if (!searchTerm) return produits;
    return produits.filter(produit =>
      produit.nom.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [produits, searchTerm]);

  return (
    <div className="produits-list">
      <div className="list-header">
        <h3>Mes produits ({filteredProduits.length})</h3>
        <SearchBar
          placeholder="Rechercher un produit..."
          value={searchTerm}
          onChange={setSearchTerm}
        />
      </div>
      <div className="produits-grid">
        {filteredProduits.map((produit) => (
          <Card key={produit.id} className="produit-card">
            <div className="produit-image">
              {produit.image ? (
                <img src={produit.image} alt={produit.nom} />
              ) : (
                <div className="placeholder-image"><Package /></div>
              )}
            </div>
            <CardContent className="produit-info">
              <h4>{produit.nom}</h4>
              <p className="produit-prix">{produit.prix.toLocaleString()} FCFA</p>
            </CardContent>
            <CardFooter className="produit-actions">
              <Button type="button" variant="outline" size="icon" onClick={() => onEdit(produit)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button type="button" variant="destructive" size="icon" onClick={() => onDelete(produit.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProduitsList;
