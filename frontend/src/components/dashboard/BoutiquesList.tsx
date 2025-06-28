import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface Boutique {
  id: string;
  name: string;
  description: string;
  location: string;
  // Tu peux rajouter d'autres champs si besoin
}

interface BoutiquesListProps {
  boutiques: Boutique[];
}

const BoutiquesList: React.FC<BoutiquesListProps> = ({ boutiques }) => {
  return (
    <div className="boutiques-list">
      {boutiques.map((boutique) => (
        <Card key={boutique.id} className="boutique-card">
          <CardContent>
            <h4>{boutique.name}</h4>
            <p>{boutique.description}</p>
            <p><strong>Localisation :</strong> {boutique.location}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default BoutiquesList;
