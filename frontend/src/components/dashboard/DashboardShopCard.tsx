import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Upload, Download, Trash2 } from 'lucide-react';
import { Boutique } from '@/types';

interface DashboardShopCardProps {
  boutique: Boutique;
  onPublishToggle: (id: string, publish: boolean) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const DashboardShopCard: React.FC<DashboardShopCardProps> = ({ boutique, onPublishToggle, onEdit, onDelete }) => {
  const { _id, name, description, images, is_published, category } = boutique;

  return (
    <Card className="overflow-hidden flex flex-col justify-between hover:shadow-lg transition-shadow duration-300">
      <div>
        <div className="relative">
          <img 
            src={images?.[0] || 'https://via.placeholder.com/400x225?text=Aucune+Image'} 
            alt={name} 
            className="w-full h-40 object-cover" 
          />
          <Badge className="absolute top-2 right-2" variant={is_published ? 'default' : 'secondary'}>
            {is_published ? 'Publiée' : 'Brouillon'}
          </Badge>
        </div>
        <CardHeader className='pb-2 pt-4'>
          <h3 className="font-semibold text-lg truncate" title={name}>{name}</h3>
          <Badge variant="outline">{category}</Badge>
        </CardHeader>
        <CardContent className='py-0'>
          <p className="text-sm text-muted-foreground line-clamp-2 h-10">{description}</p>
        </CardContent>
      </div>
      <CardFooter className="p-4 flex justify-between items-center bg-slate-50">
        {is_published ? (
          <Button size="sm" variant="outline" onClick={() => onPublishToggle(_id, false)}>
            <Download className="h-4 w-4 mr-1" /> Dépublier
          </Button>
        ) : (
          <Button size="sm" onClick={() => onPublishToggle(_id, true)}>
            <Upload className="h-4 w-4 mr-1" /> Publier
          </Button>
        )}
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" onClick={() => onEdit(_id)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="destructive" onClick={() => onDelete(_id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default DashboardShopCard;