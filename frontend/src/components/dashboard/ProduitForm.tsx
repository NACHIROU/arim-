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
  const [imageFiles, setImageFiles] = useState<File[]>([]);
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
    setImageFiles([]);
  }, [isEditing, editingProduct]);

  const handleGenerateDescription = async () => {
    if (!name) {
      alert("Veuillez d'abord entrer le nom du produit.");
      return;
    }
    setIsGenerating(true);
    const shopCategory = boutiques.find(b => b._id === selectedShopId)?.category;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/ai/generate-description`, {
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
      ? `${import.meta.env.VITE_API_BASE_URL}/products/update-products/${editingProduct?._id}`
      : `${import.meta.env.VITE_API_BASE_URL}/products/create-products/`;
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
      
      alert(`Produit ${isEditing ? 'modifié' : 'créé'} avec Succès ✅  !`);
      onSuccess();
    } catch (error) {
      console.error('Erreur formulaire produit:', error);
      alert("Une erreur est survenue.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm mb-8">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-t-lg">
        <CardTitle className="text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          {isEditing ? 'Modifier le produit' : 'Ajouter un nouveau produit'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Select value={selectedShopId} required disabled={isEditing}>
            <SelectTrigger className="border-0 bg-muted/50 focus:ring-2 focus:ring-primary/20 rounded-xl h-12">
              <SelectValue placeholder="Boutique à laquelle ajouter le produit" />
            </SelectTrigger>
            <SelectContent>
              {boutiques.map((boutique) => (
                <SelectItem key={boutique._id} value={boutique._id}>{boutique.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input 
            className="border-0 bg-muted/50 focus:ring-2 focus:ring-primary/20 rounded-xl h-12 text-foreground placeholder:text-muted-foreground" 
            placeholder="Nom du produit" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            required 
          />

          <div className="space-y-2">
            <label htmlFor="product-description" className="text-sm font-semibold text-foreground">Description</label>
            <div className="relative">
              <Textarea 
                className="border-0 bg-muted/50 focus:ring-2 focus:ring-primary/20 rounded-xl text-foreground placeholder:text-muted-foreground pr-12" 
                id="product-description" 
                placeholder="Décrivez votre produit ou utilisez l'IA" 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
              />
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="absolute top-2 right-2 h-8 w-8 hover:bg-orange-100 rounded-lg transition-all duration-300" 
                onClick={handleGenerateDescription} 
                disabled={isGenerating}
              >
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-primary" />}
              </Button>
            </div>
          </div>

          <Input 
            className="border-0 bg-muted/50 focus:ring-2 focus:ring-primary/20 rounded-xl h-12 text-foreground placeholder:text-muted-foreground" 
            type="number" 
            placeholder="Prix (FCFA)" 
            value={price} 
            onChange={e => setPrice(e.target.value)} 
            required 
          />

          <div className="space-y-2">
            <label htmlFor="product-images" className="text-sm font-semibold text-foreground">Image(s) du produit</label>
            <Input 
              className="border-0 bg-muted/50 focus:ring-2 focus:ring-primary/20 rounded-xl h-12 text-foreground file:bg-primary file:text-white file:border-0 file:rounded-lg file:px-4 file:py-2 file:mr-4" 
              id="product-images" 
              type="file" 
              multiple 
              onChange={e => setImageFiles(Array.from(e.target.files || []))} 
            />
            <p className="text-xs text-muted-foreground">
              {isEditing ? "Laissez vide pour ne pas changer les images." : "Sélectionnez une ou plusieurs images."}
            </p>
          </div>

          <div>
            {isEditing && editingProduct?.images && editingProduct.images.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-foreground">Images actuelles :</p>
                <div className="flex flex-wrap gap-3">
                  {editingProduct.images.map((url, index) => (
                    <img 
                      key={index} 
                      src={url} 
                      alt={`Image ${index + 1}`} 
                      className="h-24 w-24 object-cover rounded-xl border-2 border-orange-200 shadow-md hover:shadow-lg transition-all duration-300" 
                    />
                  ))}
                </div>
              </div>
            )}
            {imageFiles.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-foreground">Nouvelles images :</p>
                <div className="flex flex-wrap gap-3">
                  {imageFiles.map((file, index) => (
                    <img 
                      key={index} 
                      src={URL.createObjectURL(file)} 
                      alt={`Aperçu ${index + 1}`} 
                      className="h-24 w-24 object-cover rounded-xl border-2 border-primary shadow-md hover:shadow-lg transition-all duration-300" 
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 justify-end pt-4">
            {isEditing && (
              <Button 
                type="button" 
                variant="ghost" 
                onClick={onCancelEdit}
                className="hover:bg-orange-50 text-foreground transition-all duration-300"
              >
                Annuler
              </Button>
            )}
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8"
            >
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