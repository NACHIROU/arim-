import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface ShopCardProps {
  id: string;
  imageUrl: string;
  name: string;
  description: string;
}

const ShopCard = ({ id, imageUrl, name, description }: ShopCardProps) => {
  return (
    <Link to={`/shops/${id}`} className="block">
      <Card className="overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1">
        <CardHeader className="p-0">
          <AspectRatio ratio={16 / 9}>
            <img src={imageUrl} alt={name} className="object-cover w-full h-full" />
          </AspectRatio>
        </CardHeader>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg">{name}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ShopCard;
