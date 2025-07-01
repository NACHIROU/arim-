import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Badge } from '@/components/ui/badge'; // On importe le composant Badge

interface ShopCardProps {
  id: string;
  imageUrl: string;
  name: string;
  description: string;
  category: string; // <-- AJOUT
}

const ShopCard = ({ id, imageUrl, name, description, category }: ShopCardProps) => {
  return (
    <Link to={`/shops/${id}`} className="block h-full">
      <Card className="overflow-hidden h-full transition-all hover:shadow-lg hover:-translate-y-1">
        <CardHeader className="p-0">
          <AspectRatio ratio={16 / 9}>
            <img src={imageUrl} alt={name} className="object-cover w-full h-full" />
          </AspectRatio>
        </CardHeader>
        <CardContent className="p-4">
          <Badge variant="outline" className="mb-2">{category}</Badge> {/* <-- AJOUT */}
          <h3 className="font-semibold text-lg">{name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ShopCard;