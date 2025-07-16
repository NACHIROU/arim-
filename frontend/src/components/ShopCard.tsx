
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Badge } from '@/components/ui/badge';
import { Store, MapPin } from 'lucide-react';

interface ShopCardProps {
  id: string;
  imageUrl: string;
  name: string;
  description: string;
  category: string;
}

const ShopCard = ({ id, imageUrl, name, description, category }: ShopCardProps) => {
  return (
    <Link to={`/shops/${id}`} className="block h-full group">
      <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="p-0 relative overflow-hidden">
          <AspectRatio ratio={16 / 9}>
            <img 
              src={imageUrl} 
              alt={name} 
              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
            
            {/* Badge catégorie en overlay */}
            <div className="absolute top-4 left-4">
              <Badge variant="secondary" className="bg-white/90 text-foreground shadow-lg">
                <Store className="h-3 w-3 mr-1" />
                {category}
              </Badge>
            </div>
          </AspectRatio>
        </CardHeader>
        
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-xl text-foreground group-hover:text-primary transition-colors duration-200">
              {name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {description}
            </p>
          </div>
          
          <div className="flex items-center text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 mr-1 text-primary" />
            <span>Voir l'emplacement</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ShopCard;