import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Badge } from '@/components/ui/badge';
import { Store, MapPin, Star, ArrowRight } from 'lucide-react';
import { Boutique } from '@/types';
import ImageWithFallback from './ui/ImageWithFallback';

interface PublicBoutiqueCardProps {
  boutique: Boutique;
}

const PublicBoutiqueCard = ({ boutique }: PublicBoutiqueCardProps) => {
  const imageUrl = (boutique.images && boutique.images.length > 0)
    ? boutique.images[0]
    : 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80';

  return (
    <Link to={`/shops/${boutique._id}`} className="block h-full group">
      <Card className="h-full flex flex-col bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300">
        <CardHeader className="p-0 relative overflow-hidden bg-slate-100">
          <AspectRatio ratio={16 / 10}>
            <ImageWithFallback 
              src={imageUrl} 
              alt={boutique.name} 
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 ease-out" 
            />
            
            {/* Badge catégorie sobre */}
            <div className="absolute top-3 left-3 z-10">
              <Badge variant="secondary" className="bg-white/95 text-slate-800 border border-slate-200/60 shadow-sm text-xs font-semibold px-2.5 py-1 rounded-md">
                <Store className="h-3 w-3 mr-1 text-orange-500" />
                {boutique.category || "Commerce"}
              </Badge>
            </div>
            
            {/* Note sobre */}
            <div className="absolute top-3 right-3 z-10">
              <div className="flex items-center gap-1 bg-white/95 text-slate-800 border border-slate-200/60 px-2 py-0.5 rounded-md shadow-sm">
                <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                <span className="text-xs font-bold">4.8</span>
              </div>
            </div>
          </AspectRatio>
        </CardHeader>
        
        <CardContent className="p-5 flex-grow flex flex-col justify-between space-y-3">
          <div className="space-y-1.5">
            <h3 className="font-bold text-lg text-slate-900 group-hover:text-orange-600 transition-colors duration-200 line-clamp-1 leading-snug">
              {boutique.name}
            </h3>
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
              {boutique.description || "Boutique locale proposant des produits sélectionnés avec soin."}
            </p>
          </div>
          
          <div className="flex items-center justify-between pt-3 border-t border-slate-100/80 mt-auto">
            <div className="flex items-center text-xs font-medium text-slate-500 line-clamp-1">
              <MapPin className="h-3.5 w-3.5 mr-1 text-orange-500 shrink-0" />
              <span className="truncate">{boutique.location || "Cotonou"}</span>
            </div>
            <div className="text-orange-600 font-semibold text-xs flex items-center gap-1 group-hover:translate-x-0.5 transition-transform shrink-0">
              <span>Visiter</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default PublicBoutiqueCard;