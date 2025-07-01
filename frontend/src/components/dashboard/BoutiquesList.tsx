import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Badge } from '@/components/ui/badge'; // On importe le composant Badge

interface Boutique {
  id: string;
  name: string;
  description: string;
  location: string;
  category: string; // <-- AJOUT
  is_published: boolean;
  images?: string[];
}

interface BoutiquesListProps {
  boutiques: Boutique[];
  onPublishToggle: (id: string, publish: boolean) => void;
}

const BoutiquesList: React.FC<BoutiquesListProps> = ({ boutiques, onPublishToggle }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {boutiques.map((boutique) => (
        <Card key={boutique.id} className="hover:shadow-lg transition flex flex-col">
          {boutique.images && boutique.images.length > 0 && (
            <CardHeader className="p-0">
              <AspectRatio ratio={16 / 9}>
                <img src={boutique.images[0]} alt={boutique.name} className="object-cover w-full h-full rounded-t-lg" />
              </AspectRatio>
            </CardHeader>
          )}

          <CardContent className="p-4 flex-grow">
            <Badge variant="secondary" className="mb-2">{boutique.category}</Badge> {/* <-- AJOUT */}
            <h3 className="font-semibold text-xl mb-2">{boutique.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-3">{boutique.description}</p>
          </CardContent>

          <CardFooter className="p-4 flex justify-between">
            <Button variant={boutique.is_published ? "destructive" : "default"} onClick={() => onPublishToggle(boutique.id, !boutique.is_published)}>
              {boutique.is_published ? "Dépublier" : "Publier"}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default BoutiquesList;