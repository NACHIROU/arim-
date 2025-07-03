import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Boutique } from '@/types';
// L'interface peut être importée depuis votre page Shops.tsx si vous la partagez

interface PublicBoutiqueCardProps {
  boutique: Boutique;
}

const PublicBoutiqueCard: React.FC<PublicBoutiqueCardProps> = ({ boutique }) => {
  return (
    <Link to={`/shops/${boutique._id}`} className="block h-full">
      <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
        <CardHeader className="p-0">
          <AspectRatio ratio={16 / 9}>
            {boutique.images && boutique.images.length > 0 ? (
              <img src={boutique.images[0]} alt={boutique.name} className="object-cover w-full h-full rounded-t-lg" />
            ) : (
              <div className="bg-secondary flex items-center justify-center h-full rounded-t-lg">
                <span className="text-sm text-muted-foreground">Aucune image</span>
              </div>
            )}
          </AspectRatio>
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <Badge variant="outline" className="mb-2">{boutique.category}</Badge>
          <h3 className="font-semibold text-lg mb-2">{boutique.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{boutique.description}</p>
        </CardContent>
      </Card>
    </Link>
  );
};

export default PublicBoutiqueCard;