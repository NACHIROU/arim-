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
    <Card className="overflow-hidden h-full flex flex-col group transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border-0 bg-white shadow-xl rounded-[2rem]">
      <CardHeader className="p-0 relative overflow-hidden">
        <Link to={`/products/${product._id}`}>
          <AspectRatio ratio={4 / 3}>
            <img 
              src={imageUrl} 
              alt={product.name} 
              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110" 
            />
            <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]"></div>
          </AspectRatio>
        </Link>
        
        {/* Badge pour la catégorie de la boutique */}
        {product.shop?.category && (
          <div className="absolute top-4 left-4">
            <Badge variant="secondary" className="bg-white/90 text-foreground shadow-lg font-bold">
              <Tag className="h-3 w-3 mr-1" />
              {product.shop.category}
            </Badge>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-6 flex-grow space-y-3">
        <Link to={`/products/${product._id}`} className="block">
          <h3 className="font-black text-xl text-gray-900 group-hover:text-orange-500 transition-colors duration-300 line-clamp-1 leading-tight">
            {product.name}
          </h3>
        </Link>
        
        {product.shop && (
          <Link to={`/shops/${product.shop._id}`} className="block">
            <p className="text-sm font-bold text-gray-400 hover:text-orange-500 transition-colors flex items-center gap-1.5">
              <Store className="h-4 w-4" /> 
              <span className="hover:underline">{product.shop.name}</span>
            </p>
          </Link>
        )}
      </CardContent>
      
      <CardFooter className="p-6 pt-0 flex justify-between items-center mt-auto">
        <p className="font-black text-orange-600 text-xl">{product.price.toLocaleString('fr-FR')} <span className="text-xs font-normal text-gray-400">FCFA</span></p>
        <Button 
          variant="secondary" 
          size="icon" 
          onClick={(e) => {
            e.preventDefault();
            addToCart(product);
          }} 
          title="Ajouter au panier"
          className="h-10 w-10 rounded-xl bg-orange-100 text-orange-600 hover:bg-orange-200 hover:scale-110 transition-all border-0"
        >
          <ShoppingCart className="h-5 w-5" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;