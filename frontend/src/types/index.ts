// Ce fichier contiendra toutes vos interfaces partagées.

export interface Boutique {
  _id: string;
  name: string;
  description: string;
  location: string;
  category: string;
  is_published: boolean;
  images?: string[];
}

export interface Produit {
  _id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  shop_id: string;
  shopName?: string; // <-- Rendre optionnel
  shop?: {         // <-- Rendre optionnel
    _id: string;
    name: string;
  };
}
