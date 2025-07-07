// Ce fichier contiendra toutes vos interfaces partagées.

export interface Boutique {
  _id: string;
  name: string;
  description: string;
  location: string;
  category: string;
  is_published: boolean;
  images?: string[];
  contact_phone?: string;
}

export interface Produit {
  [x: string]: any;
  _id: string;
  name: string;
  description: string;
  price: number;
  images?: string[];
  shop_id: string;
  shopName?: string; // <-- Rendre optionnel
  shop?: {
    contact_phone: any;         // <-- Rendre optionnel
    _id: string;
    name: string;
  };
}

export interface User {
  id: string; // ou _id selon ce que votre API renvoie pour /users/me
  _id: string;
  first_name: string;
  email: string;
  phone?: string;
  location?: string;
  role: 'client' | 'merchant';
}


