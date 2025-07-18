import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Badge } from '@/components/ui/badge';
import { Button } from './ui/button';
import { Store, ShoppingCart, Tag } from 'lucide-react';
import { Produit } from '@/types';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Produit;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  const imageUrl = (product.images && product.images.length > 0) 
    ? product.images[0] 
    : 'https://via.placeholder.com/400x300?text=Image';

  return (
    <Card className="overflow-hidden h-full flex flex-col group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader className="p-0 relative overflow-hidden">
        <Link to={`/products/${product._id}`}>
          <AspectRatio ratio={4 / 3}>
            <img 
              src={imageUrl} 
              alt={product.name} 
              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
          </AspectRatio>
        </Link>
        
        {/* Badge pour la catégorie de la boutique */}
        {product.shop?.category && (
          <div className="absolute top-4 left-4">
            <Badge variant="secondary" className="bg-white/90 text-foreground shadow-lg">
              <Tag className="h-3 w-3 mr-1" />
              {product.shop.category}
            </Badge>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-4 flex-grow space-y-2">
        <Link to={`/products/${product._id}`} className="block">
          <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-2">
            {product.name}
          </h3>
        </Link>
        
        {product.shop && (
          <Link to={`/shops/${product.shop._id}`} className="block">
            <p className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
              <Store className="h-4 w-4" /> 
              <span className="hover:underline">{product.shop.name}</span>
            </p>
          </Link>
        )}
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <p className="font-bold text-primary text-lg">{product.price.toLocaleString('fr-FR')} FCFA</p>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => addToCart(product)} 
          title="Ajouter au panier"
          className="transition-transform hover:scale-110"
        >
          <ShoppingCart className="h-5 w-5" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;