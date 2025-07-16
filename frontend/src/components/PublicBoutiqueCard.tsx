import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Badge } from '@/components/ui/badge';
import { Store, MapPin, Star } from 'lucide-react';
import { Boutique } from '@/types';

interface PublicBoutiqueCardProps {
  boutique: Boutique;
}

const PublicBoutiqueCard = ({ boutique }: PublicBoutiqueCardProps) => {
  return (
    <Link to={`/shops/${boutique._id}`} className="block h-full group">
      <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="p-0 relative overflow-hidden">
          <AspectRatio ratio={16 / 9}>
            <img 
              src={boutique.images[0] || 'https://via.placeholder.com/400x225?text=Boutique'} 
              alt={boutique.name} 
              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
            
            {/* Badge catégorie en overlay */}
            <div className="absolute top-4 left-4">
              <Badge variant="secondary" className="bg-white/90 text-foreground shadow-lg">
                <Store className="h-3 w-3 mr-1" />
                {boutique.category}
              </Badge>
            </div>
            
            {/* Rating en overlay */}
            <div className="absolute top-4 right-4">
              <div className="flex items-center gap-1 bg-white/90 px-2 py-1 rounded-full shadow-lg">
                <Star className="h-3 w-3 text-yellow-500 fill-current" />
                <span className="text-xs font-semibold">4.8</span>
              </div>
            </div>
          </AspectRatio>
        </CardHeader>
        
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-xl text-foreground group-hover:text-primary transition-colors duration-200">
              {boutique.name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {boutique.description}
            </p>
          </div>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center">
              <MapPin className="h-3 w-3 mr-1 text-primary" />
              <span>Voir l'emplacement</span>
            </div>
            <div className="text-primary font-semibold">
              Découvrir →
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default PublicBoutiqueCard;