// Ce fichier contient toutes les interfaces partagées.

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
  id: string; // Vient de Pydantic
  name: string;
  description?: string;
  price: number;
  images?: string[];
  shop_id: string;
  // L'objet boutique imbriqué, la seule source de vérité pour les infos de la boutique
  shop?: {
    id: string;
    _id: string; // Pour la compatibilité avec les composants existants
    name: string;
    contact_phone?: string;
    category?: string;
    location?: string;
  };
}

export interface User {
  _id: string;
  first_name: string;
  email: string;
  phone?: string;
  role: 'client' | 'merchant' | 'admin';
  is_active: boolean;
}

export interface Review {
  _id: string;
  rating: number;
  message: string;
  created_at: string;
  shop_details: Boutique;
}

export interface Suggestion {
  _id: string;
  name: string;
  email: string;
  message: string;
  status: 'nouveau' | 'lu' | 'répondu';
  created_at: string;
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
  shop_name: string;
  products: OrderedProduct[];
  sub_total: number;
  status: 'En attente' | 'En cours de livraison' | 'Livrée' | 'Annulée';
}

export interface Order {
  _id: string;
  user_id: string;
  shipping_address: string;
  contact_phone: string; // <-- On s'assure qu'il est bien là
  total_price: number;
  sub_orders: SubOrder[];
  status: string;

  created_at: string;
  is_archived: boolean;
  customer?: User;
}

export interface ShopWithOrders {
  shop_id: string;
  shop_name: string;
  orders: Order[];
}