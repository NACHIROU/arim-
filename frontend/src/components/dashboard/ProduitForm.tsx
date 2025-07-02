import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil } from "lucide-react";

// --- CORRECTION 1 : L'interface doit correspondre à la donnée réelle ---
interface Boutique {
  _id: string; // On utilise _id
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
      setDescription(editingProduct.description || '');
      setPrice(String(editingProduct.price));
      setSelectedShopId(editingProduct.shop_id);
    } else {
      setName('');
      setDescription('');
      setPrice('');
      setImageFile(null);
    }
  }, [editingProduct, setSelectedShopId]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedShopId) {
      alert('Veuillez d\'abord sélectionner une boutique.');
      return;
    }

    if (!imageFile && !editingProduct) {
      alert('Veuillez sélectionner une image pour le nouveau produit.');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('shop_id', selectedShopId);
    if (imageFile) {
        formData.append('image', imageFile);
    }

    const token = localStorage.getItem('token');
    const endpoint = editingProduct
      ? `http://localhost:8000/products/update-products/${editingProduct._id}`
      // Note: Assurez-vous que l'ID du produit est bien `editingProduct.id` ou `editingProduct._id`
      : 'http://localhost:8000/products/create-products/';
    const method = editingProduct ? 'PUT' : 'POST';

    try {
      const response = await fetch(endpoint, {
        method: method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(errorData);
        alert(errorData.detail || 'Erreur lors de la soumission du produit');
        return;
      }
      
      alert(editingProduct ? 'Produit modifié avec succès' : 'Produit créé avec succès');
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
            <label>Boutique sélectionnée</label>
            <select 
              value={selectedShopId} 
              onChange={(e) => setSelectedShopId(e.target.value)} 
              required
              className="w-full p-2 border rounded-md"
            >
              <option value="" disabled>-- Choisissez une boutique --</option>
              {boutiques.map((boutique) => (
                // --- CORRECTION 2 : Utiliser ._id pour la key et la value ---
                <option key={boutique._id} value={boutique._id}>
                  {boutique.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Nom du produit</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-2 border rounded-md" />
          </div>
          <div className="form-group">
            <label>Prix (FCFA)</label>
            <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>Image du produit</label>
            <Input type="file" accept="image/*" onChange={handleImageUpload} required={!editingProduct} />
             {editingProduct?.image_url && <img src={editingProduct.image_url} alt="Aperçu" className="w-20 h-20 object-cover mt-2 rounded-md" />}
          </div>

          <div className="form-actions">
            <Button type="submit">
              {editingProduct ? <Pencil className="button-icon" /> : <Plus className="button-icon" />}
              {editingProduct ? 'Enregistrer les modifications' : 'Ajouter le produit'}
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