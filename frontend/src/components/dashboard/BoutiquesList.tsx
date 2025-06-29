import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface Boutique {
  id: string;
  name: string;
  description: string;
  location: string;
  is_published: boolean;
  images?: string[]; // Ajouté pour gérer les images
}

interface BoutiquesListProps {
  boutiques: Boutique[];
  onPublishToggle: (id: string, publish: boolean) => void;
}

const BoutiquesList: React.FC<BoutiquesListProps> = ({ boutiques, onPublishToggle }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {boutiques.map((boutique) => (
        <Card key={boutique.id} className="hover:shadow-lg transition">
          {boutique.images && boutique.images.length > 0 && (
            <CardHeader className="p-0">
              <AspectRatio ratio={16 / 9}>
                <img
                  src={boutique.images[0]}
                  alt={boutique.name}
                  className="object-cover w-full h-full"
                />
              </AspectRatio>
            </CardHeader>
          )}

          <CardContent>
            <h3 className="font-semibold text-xl mb-2">{boutique.name}</h3>
            <p className="text-sm text-muted-foreground">{boutique.description}</p>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              variant={boutique.is_published ? "destructive" : "default"}
              onClick={() => onPublishToggle(boutique.id, !boutique.is_published)}
            >
              {boutique.is_published ? "Dépublier" : "Publier"}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default BoutiquesList;
