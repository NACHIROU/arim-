import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Badge } from '@/components/ui/badge';
import { Button } from './ui/button';
import { Store, ShoppingCart, Tag } from 'lucide-react';
import { Produit } from '@/types';
import { useCart } from '@/context/CartContext';
import ImageWithFallback from './ui/ImageWithFallback';

interface ProductCardProps {
  product: Produit;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  const imageUrl = (product.images && product.images.length > 0)
    ? product.images[0]
    : 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80';

  return (
    <Card className="group h-full flex flex-col bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300">
      <CardHeader className="p-0 relative overflow-hidden bg-slate-100">
        <Link to={`/products/${product._id}`} className="block relative overflow-hidden">
          <AspectRatio ratio={4 / 3}>
            <ImageWithFallback 
              src={imageUrl} 
              alt={product.name} 
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 ease-out" 
            />
          </AspectRatio>
        </Link>
        
        {/* Badge catégorie sobre & lisible */}
        {product.shop?.category && (
          <div className="absolute top-3 left-3 z-10">
            <Badge variant="secondary" className="bg-white/95 text-slate-800 border border-slate-200/60 shadow-sm text-xs font-semibold px-2.5 py-1 rounded-md backdrop-blur-none">
              <Tag className="h-3 w-3 mr-1 text-orange-500" />
              {product.shop.category}
            </Badge>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-5 flex-grow flex flex-col justify-between space-y-3">
        <div>
          <Link to={`/products/${product._id}`} className="block">
            <h3 className="font-bold text-base text-slate-900 group-hover:text-orange-600 transition-colors duration-200 line-clamp-1 leading-snug">
              {product.name}
            </h3>
          </Link>
          
          {product.shop && (
            <Link to={`/shops/${product.shop._id || product.shop.id}`} className="inline-block mt-1.5">
              <p className="text-xs font-medium text-slate-500 hover:text-orange-600 transition-colors flex items-center gap-1.5">
                <Store className="h-3.5 w-3.5 text-slate-400" /> 
                <span className="hover:underline line-clamp-1">{product.shop.name}</span>
              </p>
            </Link>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-5 pt-0 flex justify-between items-center mt-auto border-t border-slate-100/80 pt-3">
        <div className="flex flex-col">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Prix</span>
          <p className="font-bold text-slate-900 text-lg">
            {product.price.toLocaleString('fr-FR')} <span className="text-xs font-semibold text-orange-600">FCFA</span>
          </p>
        </div>

        <Button 
          variant="default"
          size="sm" 
          onClick={(e) => {
            e.preventDefault();
            addToCart(product);
          }} 
          title="Ajouter au panier"
          className="h-9 px-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-medium shadow-sm hover:shadow transition-all flex items-center gap-1.5"
        >
          <ShoppingCart className="h-4 w-4" />
          <span className="text-xs font-semibold">Ajouter</span>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;