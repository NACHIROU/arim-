
import { useParams } from 'react-router-dom';
import { products, shops } from '@/data';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart, Store, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import NotFound from './NotFound';

const ProductDetail = () => {
  const { productId } = useParams<{ productId: string }>();
  const product = products.find(p => p.id === Number(productId));
  const shop = shops.find(s => s.name === product?.seller);

  if (!product) {
    return <NotFound />;
  }

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image du produit */}
        <div>
          <AspectRatio ratio={1} className="bg-muted mb-4">
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="object-cover w-full h-full rounded-lg" 
            />
          </AspectRatio>
          
          {/* Galerie miniature (simulation) */}
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((index) => (
              <AspectRatio key={index} ratio={1} className="bg-muted">
                <img 
                  src={product.imageUrl} 
                  alt={`${product.name} ${index}`}
                  className="object-cover w-full h-full rounded opacity-70 hover:opacity-100 cursor-pointer transition-opacity" 
                />
              </AspectRatio>
            ))}
          </div>
        </div>

        {/* Informations du produit */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex text-yellow-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">(128 avis)</span>
            </div>
            <p className="text-3xl font-bold text-primary mb-6">{product.price.toFixed(2)} FCFA</p>
          </div>

          {/* Description détaillée */}
          <div>
            <h2 className="text-xl font-semibold mb-3">Description</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Ce produit exceptionnel allie qualité et innovation pour répondre à tous vos besoins. 
              Conçu avec soin par nos artisans, il représente le parfait équilibre entre fonctionnalité 
              et esthétique. Que vous soyez professionnel ou amateur, ce produit saura vous accompagner 
              dans toutes vos activités.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Fabriqué avec des matériaux de première qualité et selon les standards les plus élevés, 
              ce produit vous garantit durabilité et performance. Son design moderne s'intègrera 
              parfaitement dans votre environnement quotidien.
            </p>
          </div>

          {/* Caractéristiques */}
          <div>
            <h2 className="text-xl font-semibold mb-3">Caractéristiques</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Matériaux premium de haute qualité</li>
              <li>• Design ergonomique et moderne</li>
              <li>• Garantie 2 ans incluse</li>
              <li>• Livraison gratuite en France</li>
              <li>• Service client 7j/7</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <Button size="lg" className="w-full">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Ajouter au panier
            </Button>
            
            {shop && (
              <Link to={`/shops/${shop.id}`}>
                <Button variant="outline" size="lg" className="w-full">
                  <Store className="mr-2 h-4 w-4" />
                  Voir la boutique {shop.name}
                </Button>
              </Link>
            )}
          </div>

          {/* Informations boutique */}
          {shop && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Vendu par {shop.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{shop.description}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>⭐ 4.8/5</span>
                  <span>•</span>
                  <span>1,234 ventes</span>
                  <span>•</span>
                  <span>Membre depuis 2020</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Produits similaires */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-8">Produits similaires</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.filter(p => p.id !== product.id).slice(0, 4).map((similarProduct) => (
            <Link key={similarProduct.id} to={`/products/${similarProduct.id}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <AspectRatio ratio={4/3}>
                  <img 
                    src={similarProduct.imageUrl} 
                    alt={similarProduct.name}
                    className="object-cover w-full h-full" 
                  />
                </AspectRatio>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-1">{similarProduct.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">par {similarProduct.seller}</p>
                  <p className="font-bold">{similarProduct.price.toFixed(2)} FCFA</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
