import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil } from "lucide-react";

interface ProduitFormProps {
  onSubmit: (productData: any) => void;
  editingProduct: any | null;
  onCancelEdit: () => void;
}

const ProduitForm: React.FC<ProduitFormProps> = ({ onSubmit, editingProduct, onCancelEdit }) => {
  const [nom, setNom] = useState('');
  const [prix, setPrix] = useState('');
  const [image, setImage] = useState('');

  useEffect(() => {
    if (editingProduct) {
      setNom(editingProduct.nom);
      setPrix(String(editingProduct.prix));
      setImage(editingProduct.image);
    } else {
      setNom('');
      setPrix('');
      setImage('');
    }
  }, [editingProduct]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const imageUrl = URL.createObjectURL(e.target.files[0]);
      setImage(imageUrl);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ nom, prix: parseFloat(prix), image });
  };

  return (
    <Card className="form-card produit-form-card">
      <CardHeader>
        <CardTitle>{editingProduct ? 'Modifier le produit' : 'Ajouter un produit'}</CardTitle>
        <CardDescription>
          {editingProduct ? 'Mettez à jour les informations du produit.' : 'Ajoutez un nouveau produit à votre catalogue'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="produit-form">
          <div className="form-row">
            <div className="form-group">
              <label>Nom du produit</label>
              <Input value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Mon Super Produit" required />
            </div>
            <div className="form-group">
              <label>Prix (FCFA)</label>
              <Input type="number" step="0.01" value={prix} onChange={(e) => setPrix(e.target.value)} placeholder="25000" required />
            </div>
          </div>
          <div className="form-group">
            <label>Image du produit</label>
            <Input type="file" accept="image/*" onChange={handleImageUpload} />
            {image && <img src={image} alt="Aperçu produit" className="image-preview" />}
          </div>
          <div className="form-actions">
            <Button type="submit" className="submit-button">
              {editingProduct ? <Pencil className="button-icon" /> : <Plus className="button-icon" />}
              {editingProduct ? 'Modifier le produit' : 'Ajouter le produit'}
            </Button>
            {editingProduct && (
              <Button type="button" variant="ghost" onClick={onCancelEdit}>Annuler</Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProduitForm;
