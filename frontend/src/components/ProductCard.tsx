
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
    <Card className="group relative overflow-hidden border-0 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 rounded-3xl">
      <CardHeader className="p-0 relative overflow-hidden">
        <Link to={`/products/${product._id}`}>
          <AspectRatio ratio={4 / 3}>
            <img 
              src={imageUrl} 
              alt={product.name} 
              className="object-cover w-full h-full transition-all duration-700 group-hover:scale-110 rounded-t-3xl" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
          </AspectRatio>
        </Link>
        
        {/* Floating action buttons */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 group-hover:translate-x-0">
          <Button size="icon" variant="secondary" className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 shadow-xl">
            <Heart className="h-4 w-4 text-white" />
          </Button>
          <Button size="icon" variant="secondary" className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 shadow-xl">
            <Eye className="h-4 w-4 text-white" />
          </Button>
        </div>
        
        {showShopLink && product.shop?._id && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center rounded-t-3xl">
            <Link to={`/shops/${product.shop._id}`}>
              <Button variant="secondary" className="bg-white/90 backdrop-blur-sm hover:bg-white text-black border-0 rounded-full px-6 py-2 shadow-xl transform scale-90 hover:scale-100 transition-all duration-300">
                <Store className="h-4 w-4 mr-2" />
                Voir la boutique
              </Button>
            </Link>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-6 space-y-4">
        <Link to={`/products/${product._id}`} className="block">
          <h3 className="font-bold text-xl text-gray-900 hover:text-primary transition-colors duration-300 truncate leading-tight">
            {product.name}
          </h3>
        </Link>
        
        {product.shop && (
          <Link to={`/shops/${product.shop._id}`} className="block">
            <p className="text-sm text-gray-500 hover:text-primary transition-colors duration-300 flex items-center gap-2 font-medium">
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-orange-400 to-amber-400 flex items-center justify-center">
                <Store className="h-2.5 w-2.5 text-white" />
              </div>
              <span className="hover:underline">{product.shop.name}</span>
            </p>
          </Link>
        )}
      </CardContent>
      
      <CardFooter className="p-6 pt-0 flex justify-between items-center">
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-5 py-3 rounded-2xl shadow-lg">
          <p className="font-bold text-lg">{product.price.toLocaleString('fr-FR')} FCFA</p>
        </div>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => addToCart(product)} 
          title="Ajouter au panier"
          className="w-12 h-12 rounded-full border-2 border-orange-200 bg-orange-50 hover:border-orange-400 hover:bg-orange-100 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-110"
        >
          <ShoppingCart className="h-5 w-5 text-orange-600" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
