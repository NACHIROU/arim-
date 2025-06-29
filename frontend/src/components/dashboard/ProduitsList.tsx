import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Pencil, Trash2 } from "lucide-react";
import SearchBar from './SearchBar';

interface Produit {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  shop_id: string;
}

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
              {produit.image_url ? (
                <img src={produit.image_url} alt={produit.name} />
              ) : (
                <div className="placeholder-image">
                  <Package />
                </div>
              )}
            </div>

            <CardContent className="produit-info">
              <h4>{produit.name}</h4>
              <p className="produit-prix">{produit.price.toLocaleString()} FCFA</p>
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
