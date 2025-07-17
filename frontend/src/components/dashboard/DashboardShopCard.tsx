import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Boutique } from '@/types';
import { Pencil, Trash2, Eye, EyeOff, MapPin, Store } from 'lucide-react';

interface DashboardShopCardProps {
  boutique: Boutique;
  onPublishToggle: (id: string, publish: boolean) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const DashboardShopCard: React.FC<DashboardShopCardProps> = ({
  boutique,
  onPublishToggle,
  onEdit,
  onDelete,
}) => {
  const isPublished = boutique.is_published;

  return (
    <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white/90 backdrop-blur-sm">
      <CardHeader className="p-0 relative overflow-hidden">
        <div className="aspect-video bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center relative">
          {boutique.images ? (
            <img 
              src={boutique.images[0]} 
              alt={boutique.name} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
            />
          ) : (
            <Store className="h-16 w-16 text-primary opacity-50" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            <Badge 
              variant={isPublished ? "default" : "secondary"}
              className={isPublished 
                ? "bg-green-500 text-white shadow-lg"
                : "bg-gray-500 text-white shadow-lg"
              }
            >
              {isPublished ? "Publié" : "Privé"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 space-y-3">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors duration-300 truncate">
            {boutique.name}
          </h3>
          <Badge variant="outline" className="text-xs border-orange-200 text-primary">
            {boutique.category}
          </Badge>
        </div>
        
        {boutique.location && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="truncate">{boutique.location}</span>
          </div>
        )}
        
        {boutique.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {boutique.description}
          </p>
        )}
      </CardContent>
      
      <CardFooter className="p-3 bg-gradient-to-r from-orange-50 to-yellow-50 border-t border-orange-100">
        <div className="flex justify-between items-center w-full gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPublishToggle(boutique._id, !isPublished)}
            className={isPublished 
              ? "text-orange-600 hover:bg-orange-100 transition-all duration-300"
              : "text-green-600 hover:bg-green-100 transition-all duration-300"
            }
          >
            {isPublished ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
            {isPublished ? "Dépublier" : "Publier"}
          </Button>
          
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onEdit(boutique._id)}
              className="hover:bg-orange-100 text-primary hover:text-primary transition-all duration-300"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onDelete(boutique._id)}
              className="hover:bg-red-100 text-red-600 hover:text-red-700 transition-all duration-300"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default DashboardShopCard;
