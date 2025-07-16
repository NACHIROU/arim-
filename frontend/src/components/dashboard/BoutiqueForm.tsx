import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Boutique } from '@/types';
import { Loader2, LocateFixed, Sparkles } from 'lucide-react';

interface BoutiqueFormProps {
  onSuccess: () => void;
  isEditing?: boolean;
  initialData?: Boutique | null;
  onCancelEdit?: () => void;
}

const BoutiqueForm: React.FC<BoutiqueFormProps> = ({ 
  onSuccess, 
  isEditing = false, 
  initialData = null,
  onCancelEdit 
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (isEditing && initialData) {
      setName(initialData.name || '');
      setDescription(initialData.description || '');
      setLocation(initialData.location || '');
      setCategory(initialData.category || '');
    } else {
      setName(''); setDescription(''); setLocation(''); setCategory('');
    }
    setImages([]);
  }, [isEditing, initialData]);

  const handleGeolocate = () => {
    setIsGeocoding(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(`http://localhost:8000/shops/reverse-geocode/?lat=${latitude}&lon=${longitude}`);
          if (!response.ok) throw new Error("Impossible de trouver l'adresse.");
          const data = await response.json();
          setLocation(data.address);
        } catch (error) {
          alert("Erreur lors de la récupération de l'adresse.");
        } finally {
          setIsGeocoding(false);
        }
      },
      () => {
        alert("Impossible d'accéder à votre position. Veuillez vérifier les autorisations.");
        setIsGeocoding(false);
      }
    );
  };

const handleGenerateDescription = async () => {
  if (!name) {
    alert("Veuillez d'abord entrer le nom de la boutique.");
    return;
  }
  setIsGenerating(true);
  try {
    const response = await fetch("http://localhost:8000/ai/generate-description", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      // On ajoute la description actuelle au corps de la requête
      body: JSON.stringify({ 
        name: name, 
        target_type: 'boutique',
        category: category,
        location: location,
        description: description // <-- On envoie le texte existant
      })
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
    if (!name || !location || !category) {
      alert("Le nom, la localisation et la catégorie sont obligatoires.");
      return;
    }
    if (!isEditing && images.length === 0) {
      alert("Veuillez sélectionner au moins une image pour la nouvelle boutique.");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('location', location);
    formData.append('category', category);

    if (images.length > 0) {
      images.forEach(image => formData.append('images', image));
    }

    const endpoint = isEditing 
      ? `http://localhost:8000/shops/update-shop/${initialData?._id}`
      : "http://localhost:8000/shops/create-shop/";
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
      
      alert(`Boutique ${isEditing ? 'mise à jour' : 'créée'} avec succès !`);
      onSuccess();

    } catch (error) {
      console.error("Erreur formulaire boutique:", error);
      alert("Une erreur est survenue.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Modifier la boutique' : 'Créer une nouvelle boutique'}</CardTitle>
        <CardDescription>{isEditing ? `Vous modifiez : "${initialData?.name}"` : 'Remplissez les informations pour créer votre vitrine.'}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input className="border-0 bg-gray-200" placeholder="Nom de la boutique" value={name} onChange={e => setName(e.target.value)} required />
          <div>
            <label htmlFor="location" className="text-sm font-medium">Localisation</label>
            <div className="flex items-center gap-2">
              <Input id="location" className="border-0 bg-gray-200" placeholder="Entrez une adresse ou utilisez le GPS" value={location} onChange={e => setLocation(e.target.value)} required />
              <Button className="border-0 bg-gray-200" type="button" variant="outline" size="icon" onClick={handleGeolocate} disabled={isGeocoding} title="Me géolocaliser">
                {isGeocoding ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <Select value={category} onValueChange={setCategory} required>
            <SelectTrigger className='border-0 bg-gray-200'><SelectValue placeholder="Choisissez une catégorie" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Alimentaire & Boissons">Alimentaire & Boissons</SelectItem>
              <SelectItem value="Vêtements & Mode">Vêtements & Mode</SelectItem>
              <SelectItem value="Construction & Bâtiment">Construction & Bâtiment</SelectItem>
              <SelectItem value="Services à la personne">Services à la personne</SelectItem>
              <SelectItem value="Santé & Beauté">Santé & Beauté</SelectItem>
              <SelectItem value="Électronique & Multimédia">Électronique & Multimédia</SelectItem>
              <SelectItem value="Maison & Jardin">Maison & Jardin</SelectItem>
              <SelectItem value="Quincaillerie">Quincaillerie</SelectItem>
              <SelectItem value="Sport & Loisirs">Sport & Loisirs</SelectItem>
              <SelectItem value="Restauration & Hôtellerie">Restauration & Hôtellerie</SelectItem>
              <SelectItem value="Artisanat">Artisanat</SelectItem>
              <SelectItem value="Automobile">Automobile</SelectItem>
              <SelectItem value="Éducation & Formation">Éducation & Formation</SelectItem>
              <SelectItem value="Divers">Divers</SelectItem>
              <SelectItem value="Autre">Autre</SelectItem>
            </SelectContent>
          </Select>
          <div>
            <label htmlFor="description" className="text-sm font-medium">Description</label>
            <div className="relative">
              <Textarea className="border-0 bg-gray-200" id="description" placeholder="Décrivez votre boutique ou cliquez sur l'éclair..." value={description} onChange={e => setDescription(e.target.value)} rows={4} />
              <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 h-7 w-7" onClick={handleGenerateDescription} disabled={isGenerating} title="Générer avec l'IA">
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-primary" />}
              </Button>
            </div>
          </div>
          <div>
            <label htmlFor="images" className="text-sm font-medium">Images</label>
            <Input className="border-0 bg-gray-200" id="images" type="file" multiple onChange={e => setImages(Array.from(e.target.files || []))} />
            <p className="text-xs text-muted-foreground mt-1">{isEditing ? "Laissez vide pour ne pas changer les images existantes." : "Sélectionnez une ou plusieurs images."}</p>
          </div>
          <div className="flex gap-2 justify-end">
            {isEditing && (<Button type="button" variant="ghost" onClick={onCancelEdit}>Annuler</Button>)}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Mettre à jour' : 'Créer la boutique'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default BoutiqueForm;