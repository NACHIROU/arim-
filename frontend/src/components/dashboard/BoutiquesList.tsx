import React from 'react';
import { Boutique } from '@/types';
import DashboardShopCard from './DashboardShopCard';
import { Store } from 'lucide-react';

interface BoutiquesListProps {
  boutiques: Boutique[];
  onPublishToggle: (id: string, publish: boolean) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const BoutiquesList: React.FC<BoutiquesListProps> = ({ boutiques, onPublishToggle, onEdit, onDelete }) => {
  if (boutiques.length === 0) {
    return (
      <div className="text-center py-16 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl border-2 border-dashed border-orange-200">
        <Store className="h-16 w-16 text-primary mx-auto mb-4 opacity-50" />
        <p className="text-lg text-muted-foreground">Vous n'avez encore aucune boutique.</p>
        <p className="text-sm text-muted-foreground mt-2">
          Utilisez le formulaire ci-dessus pour commencer !
        </p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {boutiques.map((boutique) => (
        <DashboardShopCard
          key={boutique._id}
          boutique={boutique}
          onPublishToggle={onPublishToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default BoutiquesList;