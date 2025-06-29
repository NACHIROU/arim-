import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil } from "lucide-react";

interface Boutique {
  id: string;
  name: string;
}

interface ProduitFormProps {
  boutiques: Boutique[];
  selectedShopId: string;
  setSelectedShopId: (id: string) => void;
  onSuccess: () => void;
  editingProduct: any | null;
  onCancelEdit: () => void;
}

const ProduitForm: React.FC<ProduitFormProps> = ({
  boutiques,
  selectedShopId,
  setSelectedShopId,
  onSuccess,
  editingProduct,
  onCancelEdit,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name);
      setDescription(editingProduct.description);
      setPrice(String(editingProduct.price));
      setSelectedShopId(editingProduct.shop_id);
    } else {
      setName('');
      setDescription('');
      setPrice('');
      setImageFile(null);
      setSelectedShopId('');
    }
  }, [editingProduct, setSelectedShopId]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageFile) {
      alert('Veuillez sélectionner une image');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('shop_id', selectedShopId);
    formData.append('image', imageFile);

    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://localhost:8000/products/create-products/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(errorData);
        alert(errorData.detail || 'Erreur lors de la création du produit');
        return;
      }

      alert('Produit créé avec succès');
      onSuccess();
      onCancelEdit();
    } catch (error) {
      console.error('Erreur réseau ou serveur', error);
      alert('Erreur réseau ou serveur');
    }
  };

  return (
    <Card className="form-card produit-form-card">
      <CardHeader>
        <CardTitle>{editingProduct ? 'Modifier le produit' : 'Ajouter un produit'}</CardTitle>
        <CardDescription>
          {editingProduct ? 'Mettez à jour les informations du produit.' : 'Ajoutez un nouveau produit à votre boutique'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="produit-form">
          <div className="form-group">
            <label>Nom</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Prix</label>
            <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Sélectionner une boutique</label>
            <select value={selectedShopId} onChange={(e) => setSelectedShopId(e.target.value)} required>
              <option value="">Cliquez pour choisir la boutique</option>
              {boutiques.map((boutique) => (
                <option key={boutique.id} value={boutique.id}>
                  {boutique.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Image</label>
            <Input type="file" accept="image/*" onChange={handleImageUpload} required />
          </div>
          <div className="form-actions">
            <Button type="submit">
              {editingProduct ? <Pencil className="button-icon" /> : <Plus className="button-icon" />}
              {editingProduct ? 'Modifier' : 'Ajouter'}
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
