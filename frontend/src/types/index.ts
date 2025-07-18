// Ce fichier contient toutes les interfaces partagées entre le frontend et le backend.

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
  _id: string;
  name: string;
  description: string;
  price: number;
  images?: string[];
  shop_id: string;
  seller?: string; // Le nom du vendeur
  // L'objet boutique imbriqué, qui contient toutes les infos nécessaires
  shop?: {
    _id: string;
    name: string;
    contact_phone?: string;
  };
}

export interface User {
  _id: string; // On utilise _id pour être cohérent avec MongoDB
  first_name: string;
  email: string;
  phone?: string;
  location?: string;
  role: 'client' | 'merchant' | 'admin';
  is_active: boolean;
}

export interface Suggestion {
  _id: string;
  name: string;
  email: string;
  message: string;
  status: 'nouveau' | 'lu' | 'répondu';
  created_at: string; // Date au format string ISO
  admin_reply?: string;
}

export interface OrderedProduct {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface SubOrder {
  shop_id: string;
  shop_name: string; // Nom de la boutique au moment de la commande
  products: OrderedProduct[];
  sub_total: number;
  status: 'En attente' | 'En cours de livraison' | 'Livrée' | 'Annulée';
}

export interface Order {
  _id: string;
  user_id: string;
  shipping_address: string;
  total_price: number;
  sub_orders: SubOrder[];
  status: string; // Le statut global de la commande
  created_at: string; // Date au format string ISO
}