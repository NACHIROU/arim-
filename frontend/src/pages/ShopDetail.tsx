
import { useParams } from 'react-router-dom';
import { shops, products } from '@/data';
import ProductCard from '@/components/ProductCard';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Phone, Mail, Star, Users, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import NotFound from './NotFound';

const ShopDetail = () => {
  const { shopId } = useParams<{ shopId: string }>();
  const shop = shops.find(s => s.id === Number(shopId));

  if (!shop) {
    return <NotFound />;
  }
  
  const shopProducts = products.filter(p => p.seller === shop?.name);

  return (
    <div>
      {/* Bannière de la boutique */}
      <div className="mb-12">
        <AspectRatio ratio={16 / 5} className="bg-muted">
          <img src={shop.imageUrl} alt={shop.name} className="object-cover w-full h-full" />
        </AspectRatio>
      </div>

      <div className="container pb-16 md:pb-24">
        {/* En-tête de la boutique */}
        <div className="max-w-4xl mx-auto -mt-32 relative bg-background p-8 rounded-lg shadow-lg mb-12">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold shrink-0">
              {shop.name.charAt(0)}
            </div>
            
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold mb-2">{shop.name}</h1>
              <p className="text-lg text-muted-foreground mb-4">{shop.description}</p>
              
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span>4.8/5 (234 avis)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>1,567 clients</span>
                </div>
                <div className="flex items-center gap-1">
                  <Package className="h-4 w-4" />
                  <span>{shopProducts.length} produits</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button>Suivre cette boutique</Button>
                <Button variant="outline">Contacter</Button>
              </div>
            </div>
          </div>
        </div>

        {/* Contenu principal avec onglets */}
        <Tabs defaultValue="products" className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="products">Produits</TabsTrigger>
            <TabsTrigger value="about">À propos</TabsTrigger>
            <TabsTrigger value="reviews">Avis clients</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="mt-8">
            <div>
              <h2 className="text-3xl font-bold mb-8">Produits de {shop.name}</h2>
              {shopProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {shopProducts.map((product, index) => (
                    <div key={product.id} className="animate-fade-in-up" style={{ animationDelay: `${0.1 + index * 0.1}s` }}>
                      <Link to={`/products/${product.id}`}>
                        <ProductCard {...product} />
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-10">
                  Cette boutique n'a pas encore de produits.
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="about" className="mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <h2 className="text-2xl font-bold mb-6">Notre histoire</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Fondée en 2018, {shop.name} est née de la passion de créer des produits 
                    exceptionnels qui allient qualité, innovation et durabilité. Notre équipe 
                    de passionnés travaille chaque jour pour vous offrir le meilleur.
                  </p>
                  <p>
                    Nous croyons fermement que chaque produit doit raconter une histoire et 
                    apporter une valeur réelle à nos clients. C'est pourquoi nous sélectionnons 
                    avec soin chaque article de notre catalogue.
                  </p>
                  <p>
                    Aujourd'hui, nous sommes fiers de compter plus de 1,500 clients satisfaits 
                    et de continuer à grandir grâce à leur confiance et leur fidélité.
                  </p>
                </div>

                <h3 className="text-xl font-semibold mt-8 mb-4">Nos valeurs</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>✨ Qualité premium garantie</li>
                  <li>🌱 Engagement environnemental</li>
                  <li>🤝 Service client exceptionnel</li>
                  <li>🚀 Innovation constante</li>
                  <li>💯 Satisfaction client</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-6">Informations de contact</h2>
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Adresse</p>
                        <p className="text-sm text-muted-foreground">123 Rue du Commerce, 75001 Paris, France</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Téléphone</p>
                        <p className="text-sm text-muted-foreground">+33 1 23 45 67 89</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-sm text-muted-foreground">contact@{shop.name.toLowerCase().replace(/\s+/g, '')}.com</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <h3 className="text-xl font-semibold mt-8 mb-4">Horaires d'ouverture</h3>
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Lundi - Vendredi</span>
                        <span>9h00 - 18h00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Samedi</span>
                        <span>10h00 - 17h00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Dimanche</span>
                        <span className="text-muted-foreground">Fermé</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="mt-8">
            <div>
              <h2 className="text-2xl font-bold mb-6">Avis clients</h2>
              <div className="space-y-6">
                {[1, 2, 3, 4, 5].map((review) => (
                  <Card key={review}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                          U{review}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">Utilisateur {review}</h4>
                            <div className="flex text-yellow-400">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} className="h-4 w-4 fill-current" />
                              ))}
                            </div>
                          </div>
                          <p className="text-muted-foreground">
                            Excellent service et produits de qualité ! Je recommande vivement cette boutique. 
                            L'équipe est très professionnelle et à l'écoute de ses clients.
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">Il y a {review} semaine{review > 1 ? 's' : ''}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ShopDetail;
