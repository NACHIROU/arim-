import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Store, Heart, Eye } from 'lucide-react';

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
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader className="p-0 relative overflow-hidden">
        <Link to={`/products/${id}`}>
          <AspectRatio ratio={4 / 3}>
            <img 
              src={imageUrl} 
              alt={name} 
              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </AspectRatio>
        </Link>
        

        {showShopLink && shopId && (
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
            <Link to={`/shops/${shopId}`}>
              <Button variant="secondary" className="bg-white/90 hover:bg-white shadow-lg transform scale-95 hover:scale-100 transition-all">
                <Store className="h-4 w-4 mr-2" />
                Voir la boutique
              </Button>
            </Link>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-6 space-y-3">
        <Link to={`/products/${id}`} className="block">
          <h3 className="font-semibold text-lg hover:text-primary transition-colors duration-200 truncate group-hover:text-primary">
            {name}
          </h3>
        </Link>
        
        <Link to={`/shops/${shopId}`} className="block">
          <p className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-2">
            <Store className="h-4 w-4 text-primary" /> 
            <span className="hover:underline">{shopName}</span>
          </p>
        </Link>
      </CardContent>
      
      <CardFooter className="p-4 pt-2 flex justify-begin items-center gap-4 bg-white/80 backdrop-blur-sm">
        <div className="bg-orange-500 text-white px-3 py-1 rounded-xl shadow-lg flex items-center gap-2">
          <p className="font-semibold text-base">{price.toLocaleString('fr-FR')} FCFA</p>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;