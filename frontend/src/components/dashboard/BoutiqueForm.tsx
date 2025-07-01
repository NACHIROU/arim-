import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";

interface BoutiqueFormProps {
  onAddBoutique: (boutique: any) => void;
}

const categories = [
  "Alimentaire & Boissons", "Vêtements & Mode", "Santé & Beauté",
  "Électronique & Multimédia", "Maison & Jardin", "Quincaillerie", "Sport & Loisirs",
  "Restauration & Hôtellerie", "Services à la personne", "Construction & Bâtiment",
  "Automobile", "Éducation & Formation", "Artisanat", "Divers", "Autres"
];

const BoutiqueForm: React.FC<BoutiqueFormProps> = ({ onAddBoutique }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile || !category) {
      alert("Veuillez remplir tous les champs, y compris le secteur et l'image !");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("location", location);
    formData.append("category", category); // Envoi de la catégorie
    formData.append("images", imageFile);

    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://localhost:8000/shops/create-shop/", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.detail || "Erreur lors de la création de la boutique");
        return;
      }

      const data = await response.json();
      alert("Boutique créée avec succès !");
      onAddBoutique(data);

      setName(''); setDescription(''); setLocation(''); setCategory(''); setImageFile(null);
    } catch (error) {
      alert("Erreur réseau ou serveur.");
    }
  };

  return (
    <Card className="form-card">
      <CardHeader>
        <CardTitle>Ajouter une boutique</CardTitle>
        <CardDescription>Créez une nouvelle boutique pour vos produits</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="boutique-form">
          <div className="form-row">
            <div className="form-group">
              <label>Nom de la boutique</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: La Belle Étoile" required />
            </div>
            <div className="form-group">
              <label>Adresse complète</label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Ex: 123 Rue de la Paix, Cotonou" required />
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea className="description-textarea" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Décrivez votre boutique..." required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="flex items-center gap-2">
                Secteur d'activité
                <p className="text-xs italic text-orange-500 m-0">
                  (Choisissez <span className="font-bold text-orange-500 text-xs">Divers</span> si vous intervenez dans plusieurs domaines)
                </p>
              </label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue placeholder="Sélectionnez un secteur" /></SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="form-group">
              <label>Image de la boutique</label>
              <Input type="file" accept="image/*" onChange={handleImageUpload} required />
            </div>
          </div>
          <Button type="submit" className="submit-button"><Plus className="button-icon" /> Ajouter la boutique</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default BoutiqueForm;