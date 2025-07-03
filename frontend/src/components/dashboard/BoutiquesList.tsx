import React from 'react';
import { Boutique } from '@/types';
import DashboardShopCard from './DashboardShopCard';

interface BoutiquesListProps {
  boutiques: Boutique[];
  onPublishToggle: (id: string, publish: boolean) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const BoutiquesList: React.FC<BoutiquesListProps> = ({ boutiques, onPublishToggle, onEdit, onDelete }) => {
  if (boutiques.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-10 border-2 border-dashed rounded-lg mt-6">
        <p>Vous n'avez encore aucune boutique.</p>
        <p>Utilisez le formulaire ci-dessus pour commencer !</p>
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