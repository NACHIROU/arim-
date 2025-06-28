
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface ShopCardProps {
  imageUrl: string;
  name: string;
  description: string;
}

const ShopCard = ({ imageUrl, name, description }: ShopCardProps) => {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
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
  );
};

export default ShopCard;
