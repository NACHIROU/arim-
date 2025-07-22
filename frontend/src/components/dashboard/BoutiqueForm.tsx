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
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/shops/reverse-geocode/?lat=${latitude}&lon=${longitude}`);
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
      const response = await fetch("${import.meta.env.VITE_API_BASE_URL}/ai/generate-description", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
          name: name, 
          target_type: 'boutique',
          category: category,
          location: location,
          description: description
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
      ? `${import.meta.env.VITE_API_BASE_URL}/shops/update-shop/${initialData?._id}`
      : "${import.meta.env.VITE_API_BASE_URL}/shops/create-shop/";
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
      
      alert(`Boutique ${isEditing ? 'mise à jour' : 'créée'} avec Succès ✅  !`);
      onSuccess();

    } catch (error) {
      console.error("Erreur formulaire boutique:", error);
      alert("Une erreur est survenue.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader className="from-primary/10 to-accent/10 rounded-t-lg">
        <CardTitle className="text-2xl from-primary to-accent bg-clip-text text-transparent">
          {isEditing ? 'Modifier la boutique' : 'Créer une nouvelle boutique'}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {isEditing ? `Vous modifiez : "${initialData?.name}"` : 'Remplissez les informations pour créer votre vitrine.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input 
            className="border-0 bg-muted/50 focus:ring-2 focus:ring-primary/20 rounded-xl h-12 text-foreground placeholder:text-muted-foreground" 
            placeholder="Nom de la boutique" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            required 
          />
          
          <div className="space-y-2">
            <label htmlFor="location" className="text-sm font-semibold text-foreground">Localisation</label>
            <div className="flex items-center gap-3">
              <Input 
                id="location" 
                className="border-0 bg-muted/50 focus:ring-2 focus:ring-primary/20 rounded-xl h-12 text-foreground placeholder:text-muted-foreground flex-1" 
                placeholder="Entrez une adresse ou utilisez le GPS" 
                value={location} 
                onChange={e => setLocation(e.target.value)} 
                required 
              />
              <Button 
                type="button" 
                variant="outline" 
                size="icon" 
                onClick={handleGeolocate} 
                disabled={isGeocoding} 
                title="Me géolocaliser"
                className="h-12 w-12 border-orange-200 bg-orange-50 hover:bg-orange-100 text-primary rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
              >
                {isGeocoding ? <Loader2 className="h-5 w-5 animate-spin" /> : <LocateFixed className="h-5 w-5" />}
              </Button>
            </div>
          </div>
          
          <Select value={category} onValueChange={setCategory} required>
            <SelectTrigger className="border-0 bg-muted/50 focus:ring-2 focus:ring-primary/20 rounded-xl h-12">
              <SelectValue placeholder="Choisissez une catégorie" />
            </SelectTrigger>
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
          
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-semibold text-foreground">Description</label>
            <div className="relative">
              <Textarea 
                className="border-0 bg-muted/50 focus:ring-2 focus:ring-primary/20 rounded-xl text-foreground placeholder:text-muted-foreground pr-12" 
                id="description" 
                placeholder="Décrivez votre boutique ou cliquez sur l'éclair..." 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                rows={4} 
              />
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="absolute top-2 right-2 h-8 w-8 hover:bg-orange-100 rounded-lg transition-all duration-300" 
                onClick={handleGenerateDescription} 
                disabled={isGenerating} 
                title="Générer avec l'IA"
              >
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-primary" />}
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="images" className="text-sm font-semibold text-foreground">Images</label>
            <Input 
              className="border-0 bg-muted/50 focus:ring-2 focus:ring-primary/20 rounded-xl h-12 text-foreground file:bg-primary file:text-white file:border-0 file:rounded-lg file:px-4 file:py-2 file:mr-4" 
              id="images" 
              type="file" 
              multiple 
              onChange={e => setImages(Array.from(e.target.files || []))} 
            />
            <p className="text-xs text-muted-foreground">
              {isEditing ? "Laissez vide pour ne pas changer les images existantes." : "Sélectionnez une ou plusieurs images."}
            </p>
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
              className="from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8"
            >
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