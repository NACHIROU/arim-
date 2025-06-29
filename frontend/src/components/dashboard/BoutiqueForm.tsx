import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";

interface BoutiqueFormProps {
  onAddBoutique: (boutique: any) => void;
}

const secteurs = [
  "Alimentaire", "Vêtements", "Électronique", "Maison & Jardin",
  "Santé & Beauté", "Sport & Loisirs", "Automobile", "Services",
  "Artisanat", "Autres"
];

const BoutiqueForm: React.FC<BoutiqueFormProps> = ({ onAddBoutique }) => {
  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const [localisation, setLocalisation] = useState('');
  const [secteur, setSecteur] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageFile) {
      alert("Veuillez sélectionner une image !");
      return;
    }

    const formData = new FormData();
    formData.append("name", nom);
    formData.append("description", description);
    formData.append("location", localisation);
    formData.append("images", imageFile);

    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:8000/shops/create-shop/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(errorData);
        alert(errorData.detail || "Erreur lors de la création de la boutique");
        return;
      }

      const data = await response.json();
      console.log("Boutique créée :", data);
      alert("Boutique créée avec succès !");
      onAddBoutique(data);

      setNom('');
      setDescription('');
      setLocalisation('');
      setSecteur('');
      setImageFile(null);
    } catch (error) {
      console.error("Erreur réseau ou serveur :", error);
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
              <Input value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ali et Fils" required />
            </div>
            <div className="form-group">
              <label>Localisation</label>
              <Input value={localisation} onChange={(e) => setLocalisation(e.target.value)} placeholder="Cotonou, Haie Vive" required />
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea className="description-textarea" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Décrivez votre boutique..." required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Secteur d'activité</label>
              <Select value={secteur} onValueChange={setSecteur}>
                <SelectTrigger><SelectValue placeholder="Sélectionnez un secteur" /></SelectTrigger>
                <SelectContent>
                  {secteurs.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
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
