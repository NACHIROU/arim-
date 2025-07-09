import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Loader2, Sparkles } from "lucide-react";
import { Boutique, Produit } from '@/types';

interface ProduitFormProps {
  boutiques: Boutique[];
  selectedShopId: string;
  onSuccess: () => void;
  editingProduct: Produit | null;
  onCancelEdit: () => void;
}

const ProduitForm: React.FC<ProduitFormProps> = ({
  boutiques,
  selectedShopId,
  onSuccess,
  editingProduct,
  onCancelEdit,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]); // Gère plusieurs fichiers
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const token = localStorage.getItem('token');
  const isEditing = !!editingProduct;

  useEffect(() => {
    if (isEditing && editingProduct) {
      setName(editingProduct.name || '');
      setDescription(editingProduct.description || '');
      setPrice(String(editingProduct.price || 0));
    } else {
      setName('');
      setDescription('');
      setPrice('');
    }
    setImageFiles([]); // Toujours réinitialiser la sélection de fichiers
  }, [isEditing, editingProduct]);

  const handleGenerateDescription = async () => {
    if (!name) {
      alert("Veuillez d'abord entrer le nom du produit.");
      return;
    }
    setIsGenerating(true);
    const shopCategory = boutiques.find(b => b._id === selectedShopId)?.category;
    try {
      const response = await fetch("http://localhost:8000/ai/generate-description", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, target_type: 'produit', category: shopCategory })
      });
      if (!response.ok) throw new Error("La génération a échoué.");
      const data = await response.json();
      setDescription(data.description);
    } catch (error) {
      alert("Erreur lors de la génération de la description.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShopId && !isEditing) {
      alert('Veuillez sélectionner une boutique.');
      return;
    }
    if (!isEditing && imageFiles.length === 0) {
      alert('Veuillez sélectionner au moins une image pour le nouveau produit.');
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    
    if (!isEditing) {
      formData.append('shop_id', selectedShopId);
    }
    if (imageFiles.length > 0) {
      imageFiles.forEach(file => formData.append('images', file));
    }

    const endpoint = isEditing
      ? `http://localhost:8000/products/update-products/${editingProduct?._id}`
      : 'http://localhost:8000/products/create-products/';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(endpoint, {
        method: method,
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Erreur: ${await response.text()}`);
      }
      
      alert(`Produit ${isEditing ? 'modifié' : 'créé'} avec succès !`);
      onSuccess();
    } catch (error) {
      console.error('Erreur formulaire produit:', error);
      alert("Une erreur est survenue.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="produit-form-card">
      <CardHeader>
        <CardTitle>{isEditing ? 'Modifier le produit' : 'Ajouter un nouveau produit'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select value={selectedShopId} required disabled={isEditing}>
            <SelectTrigger className='bg-gray-200 border-0 focus:ring-0'><SelectValue placeholder="Boutique à laquelle ajouter le produit" /></SelectTrigger>
            <SelectContent>
              {boutiques.map((boutique) => (
                <SelectItem key={boutique._id} value={boutique._id}>{boutique.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input className='text-black bg-gray-200 border-0 focus:ring-0' placeholder="Nom du produit" value={name} onChange={e => setName(e.target.value)} required />

          <div>
            <label htmlFor="product-description" className="text-sm font-medium">Description</label>
            <div className="relative">
              <Textarea className='text-black bg-gray-200 border-0 focus:ring-0' id="product-description" placeholder="Décrivez votre produit ou utilisez l'IA" value={description} onChange={e => setDescription(e.target.value)} />
              <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 h-7 w-7" onClick={handleGenerateDescription} disabled={isGenerating}>
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-primary" />}
              </Button>
            </div>
          </div>

          <Input className='text-black bg-gray-200 border-0 focus:ring-0' type="number" placeholder="Prix (FCFA)" value={price} onChange={e => setPrice(e.target.value)} required />

          <div>
            <label htmlFor="product-images" className="text-sm font-medium">Image(s) du produit</label>
            <Input className='text-black bg-gray-200 border-0 focus:ring-0' id="product-images" type="file" multiple onChange={e => setImageFiles(Array.from(e.target.files || []))} />
            <p className="text-xs text-muted-foreground mt-1">{isEditing ? "Laissez vide pour ne pas changer les images." : "Sélectionnez une ou plusieurs images."}</p>
          </div>

          <div>
            {isEditing && editingProduct?.images && editingProduct.images.length > 0 && (
              <div className="mt-2"><p className="text-sm font-medium mb-2">Images actuelles :</p><div className="flex flex-wrap gap-2">{editingProduct.images.map((url, index) => <img key={index} src={url} alt={`Image ${index + 1}`} className="h-20 w-20 object-cover rounded-md border" />)}</div></div>
            )}
            {imageFiles.length > 0 && (
              <div className="mt-2"><p className="text-sm font-medium mb-2">Nouvelles images :</p><div className="flex flex-wrap gap-2">{imageFiles.map((file, index) => <img key={index} src={URL.createObjectURL(file)} alt={`Aperçu ${index + 1}`} className="h-20 w-20 object-cover rounded-md border" />)}</div></div>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            {isEditing && (<Button type="button" variant="ghost" onClick={onCancelEdit}>Annuler</Button>)}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Mettre à jour' : 'Ajouter le produit'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProduitForm;