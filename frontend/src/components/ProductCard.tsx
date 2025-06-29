
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';

interface ProductCardProps {
  id: string;
  imageUrl: string;
  name: string;
  seller: string;
  price: number;
  shopId?: string;
  showShopLink?: boolean;
}

const ProductCard = ({ id, imageUrl, name, seller, price, shopId, showShopLink = false }: ProductCardProps) => {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 group">
      <CardHeader className="p-0 relative">
        <Link to={`/products/${id}`}>
          <AspectRatio ratio={4 / 3}>
            <img src={imageUrl} alt={name} className="object-cover w-full h-full" />
          </AspectRatio>
        </Link>
        {showShopLink && shopId && (
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
            <Link to={`/shops/${shopId}`}>
                <Button variant="secondary" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    Voir la boutique
                </Button>
            </Link>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4">
        <Link to={`/products/${id}`}>
          <h3 className="font-semibold text-lg hover:text-primary transition-colors">{name}</h3>
        </Link>
        <p className="text-sm text-muted-foreground">par {seller}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <p className="font-bold text-lg">{price.toFixed(2)} FCFA</p>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
