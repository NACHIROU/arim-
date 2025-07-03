import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Store } from 'lucide-react'; // Ajout d'une icône pour la boutique

// --- CORRECTION : On change les props ---
interface ProductCardProps {
  id: string;
  imageUrl: string;
  name: string;
  shopName: string; // 
  price: number;
  shopId?: string;
  showShopLink?: boolean;
}

const ProductCard = ({ id, imageUrl, name, shopName, price, shopId, showShopLink = false }: ProductCardProps) => {
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
        <Link to={`/products/${id}`} className="block">
          <h3 className="font-semibold text-lg hover:text-primary transition-colors truncate">{name}</h3>
        </Link>
        {/* --- CORRECTION : On affiche le nom de la boutique --- */}
        <Link to={`/shops/${shopId}`} className="block">
            <p className="text-sm text-muted-foreground hover:underline flex items-center gap-1">
                <Store className="h-4 w-4" /> 
                {shopName}
            </p>
        </Link>
      </CardContent>
      <CardFooter className="p-4 pt-2 flex justify-end">
        <p className="font-bold text-lg">{price.toLocaleString('fr-FR')} FCFA</p>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;