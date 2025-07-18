
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Store, ShoppingCart, Heart, Eye } from 'lucide-react';
import { Produit } from '@/types';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Produit;
  showShopLink?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, showShopLink = false }) => {
  const { addToCart } = useCart();

  const imageUrl = (product.images && product.images.length > 0) 
    ? product.images[0] 
    : 'https://via.placeholder.com/400x300?text=Image';

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group border-0 bg-white/90 backdrop-blur-sm shadow-lg">
      <CardHeader className="p-0 relative overflow-hidden">
        <Link to={`/products/${product._id}`}>
          <AspectRatio ratio={4 / 3}>
            <img 
              src={imageUrl} 
              alt={product.name} 
              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </AspectRatio>
        </Link>
        
        {/* Action buttons overlay */}
        <div className="absolute top-3 right-3 space-y-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
          <Button size="icon" variant="secondary" className="h-8 w-8 bg-white/90 hover:bg-white shadow-lg">
            <Heart className="h-4 w-4 text-orange-500" />
          </Button>
          <Button size="icon" variant="secondary" className="h-8 w-8 bg-white/90 hover:bg-white shadow-lg">
            <Eye className="h-4 w-4 text-orange-500" />
          </Button>
        </div>
        
        {showShopLink && product.shop?._id && (
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
            <Link to={`/shops/${product.shop._id}`}>
              <Button variant="secondary" className="bg-white/90 hover:bg-white shadow-lg transform scale-95 hover:scale-100 transition-all">
                <Store className="h-4 w-4 mr-2 text-orange-500" />
                Voir la boutique
              </Button>
            </Link>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-6 space-y-3">
        <Link to={`/products/${product._id}`} className="block">
          <h3 className="font-semibold text-lg hover:text-orange-500 transition-colors duration-200 truncate group-hover:text-orange-500">
            {product.name}
          </h3>
        </Link>
        
        {product.shop && (
          <Link to={`/shops/${product.shop._id}`} className="block">
            <p className="text-sm text-muted-foreground hover:text-orange-500 transition-colors duration-200 flex items-center gap-2">
              <Store className="h-4 w-4 text-orange-500" /> 
              <span className="hover:underline">{product.shop.name}</span>
            </p>
          </Link>
        )}
      </CardContent>
      
      <CardFooter className="p-6 pt-0 flex justify-between items-center">
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-full shadow-lg">
          <p className="font-bold text-lg">{product.price.toLocaleString('fr-FR')} FCFA</p>
        </div>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => addToCart(product)} 
          title="Ajouter au panier"
          className="border-orange-200 hover:border-orange-300 hover:bg-orange-50 transition-all duration-300 shadow-md hover:shadow-lg"
        >
          <ShoppingCart className="h-5 w-5 text-orange-500" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
