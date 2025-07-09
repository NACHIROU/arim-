import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Boutique } from '@/types';
import { Loader2, LocateFixed } from 'lucide-react'; // On ajoute l'icône de localisation

interface BoutiqueFormProps {
  onSuccess: () => void;
  isEditing?: boolean;
  initialData?: Boutique | null;
  onCancelEdit?: () => void;
}

const BoutiqueForm: React.FC<BoutiqueFormProps> = ({ 
  onSuccess, isEditing = false, initialData = null, onCancelEdit 
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false); // État pour le chargement de la géoloc
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
    setImages([]); // On réinitialise toujours la sélection de fichiers
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
          setLocation(data.address); // On met à jour le champ de localisation
        } catch (error) {
          alert("Erreur lors de la récupération de l'adresse.");
        } finally {
          setIsGeocoding(false);
        }
      },
      () => {
        alert("Impossible d'accéder à votre position. Veuillez vérifier les autorisations de votre navigateur.");
        setIsGeocoding(false);
      }
    );
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    // On ajoute les champs seulement s'ils ont une valeur (pour la mise à jour)
    formData.append('name', name);
    formData.append('description', description);
    formData.append('location', location);
    formData.append('category', category);
    
    // On n'ajoute les images que si de nouveaux fichiers ont été sélectionnés
    if (images.length > 0) {
      images.forEach(image => formData.append('images', image));
    }

    // En mode création, les images sont obligatoires
    if (!isEditing && images.length === 0) {
      alert("Veuillez sélectionner au moins une image.");
      setIsSubmitting(false);
      return;
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
        <CardDescription>{isEditing ? `Vous modifiez : "${initialData?.name}"` : 'Remplissez les informations.'}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input className="border-0" placeholder="Nom de la boutique" value={name} onChange={e => setName(e.target.value)} required />
          <Textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
          <Input className="border-0" placeholder="Localisation" value={location} onChange={e => setLocation(e.target.value)} required />

          <div>
          <label htmlFor="location" className="text-sm font-medium">Localisation</label>
            <div className="flex items-center gap-2">
              <Input className="border-0" id="location" placeholder="Entrez une adresse ou utilisez le GPS" value={location} onChange={e => setLocation(e.target.value)} required />
              <Button type="button" variant="outline" size="icon" onClick={handleGeolocate} disabled={isGeocoding}>
                {isGeocoding ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          <Select value={category} onValueChange={setCategory} required>
            <SelectTrigger><SelectValue placeholder="Choisissez une catégorie" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Alimentaire & Boissons">Alimentaire & Boissons</SelectItem>
              <SelectItem value="Vêtements & Mode">Vêtements & Mode</SelectItem>
              <SelectItem value="Construction & Bâtiment">Construction & Bâtiment</SelectItem>
              <SelectItem value="Services à la personne">Services à la personne</SelectItem>
              <SelectItem value="Autre">Autre</SelectItem>
            </SelectContent>
          </Select>
          <div>
            <label htmlFor="images" className="text-sm font-medium">Images</label>
            <Input id="images" type="file" multiple onChange={e => setImages(Array.from(e.target.files || []))} />
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