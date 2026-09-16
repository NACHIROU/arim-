import { Boutique, Produit } from '@/types';

export const INITIAL_SHOPS: Boutique[] = [
  {
    _id: "shop-tech-1",
    name: "Tech & Co Bénin",
    description: "Les meilleurs gadgets high-tech, ordinateurs portables et accessoires certifiés à Cotonou.",
    location: "Cotonou, Haie Vive",
    category: "Électronique & Multimédia",
    is_published: true,
    contact_phone: "+22997000001",
    images: [
      "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    _id: "shop-fashion-2",
    name: "Élégance Afro Chic",
    description: "Créations textiles modernes en pagne tissé et prêt-à-porter sur mesure.",
    location: "Porto-Novo, Centre",
    category: "Vêtements & Mode",
    is_published: true,
    contact_phone: "+22997000002",
    images: [
      "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    _id: "shop-food-3",
    name: "Délices & Terroir Bio",
    description: "Épicerie fine locale, jus de fruits naturels pressés et produits du terroir frais.",
    location: "Abomey-Calavi, Arconville",
    category: "Alimentaire & Boissons",
    is_published: true,
    contact_phone: "+22997000003",
    images: [
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    _id: "shop-home-4",
    name: "Maison & Déco Moderne",
    description: "Mobilier design, artisanat d'art, luminaires et objets décoratifs pour votre intérieur.",
    location: "Cotonou, Ganhi",
    category: "Maison & Jardin",
    is_published: true,
    contact_phone: "+22997000004",
    images: [
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80"
    ]
  }
];

export const INITIAL_PRODUCTS: Produit[] = [
  {
    _id: "prod-1",
    id: "prod-1",
    name: "MacBook Pro M2 - 16 Go / 512 Go",
    description: "Ordinateur portable haute performance idéal pour les créateurs, développeurs et professionnels.",
    price: 850000,
    shop_id: "shop-tech-1",
    shop: {
      id: "shop-tech-1",
      _id: "shop-tech-1",
      name: "Tech & Co Bénin",
      category: "Électronique & Multimédia",
      location: "Cotonou, Haie Vive",
      contact_phone: "+22997000001"
    },
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    _id: "prod-2",
    id: "prod-2",
    name: "Chemise Lin & Pagne Brodé",
    description: "Chemise moderne haut de gamme confectionnée en lin respirant avec motifs brodés à la main.",
    price: 28500,
    shop_id: "shop-fashion-2",
    shop: {
      id: "shop-fashion-2",
      _id: "shop-fashion-2",
      name: "Élégance Afro Chic",
      category: "Vêtements & Mode",
      location: "Porto-Novo, Centre",
      contact_phone: "+22997000002"
    },
    images: [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    _id: "prod-3",
    id: "prod-3",
    name: "Panier Découverte Jus Naturels (Pack de 6)",
    description: "Assortiment de 6 bouteilles de jus de baobab, ananas pain de sucre et bissap sans conservateurs.",
    price: 7500,
    shop_id: "shop-food-3",
    shop: {
      id: "shop-food-3",
      _id: "shop-food-3",
      name: "Délices & Terroir Bio",
      category: "Alimentaire & Boissons",
      location: "Abomey-Calavi, Arconville",
      contact_phone: "+22997000003"
    },
    images: [
      "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    _id: "prod-4",
    id: "prod-4",
    name: "Lampe de Table Bois & Céramique",
    description: "Lampe contemporaine artisanale avec abat-jour en coton brut et finition bois précieux.",
    price: 35000,
    shop_id: "shop-home-4",
    shop: {
      id: "shop-home-4",
      _id: "shop-home-4",
      name: "Maison & Déco Moderne",
      category: "Maison & Jardin",
      location: "Cotonou, Ganhi",
      contact_phone: "+22997000004"
    },
    images: [
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    _id: "prod-5",
    id: "prod-5",
    name: "Casque Audio Sans Fil Réduction de Bruit",
    description: "Casque Bluetooth premium avec autonomie 40h et isolation acoustique active.",
    price: 65000,
    shop_id: "shop-tech-1",
    shop: {
      id: "shop-tech-1",
      _id: "shop-tech-1",
      name: "Tech & Co Bénin",
      category: "Électronique & Multimédia",
      location: "Cotonou, Haie Vive",
      contact_phone: "+22997000001"
    },
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    _id: "prod-6",
    id: "prod-6",
    name: "Robe d'Été Évasée Batik",
    description: "Robe fluide et élégante aux teintes ensoleillées, parfaite pour les sorties et cérémonies.",
    price: 32000,
    shop_id: "shop-fashion-2",
    shop: {
      id: "shop-fashion-2",
      _id: "shop-fashion-2",
      name: "Élégance Afro Chic",
      category: "Vêtements & Mode",
      location: "Porto-Novo, Centre",
      contact_phone: "+22997000002"
    },
    images: [
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    _id: "prod-7",
    id: "prod-7",
    name: "Miel Pur Sauvage de Forêt 1kg",
    description: "Miel d'apiculture traditionnelle 100% naturel récolté de manière écoresponsable.",
    price: 6000,
    shop_id: "shop-food-3",
    shop: {
      id: "shop-food-3",
      _id: "shop-food-3",
      name: "Délices & Terroir Bio",
      category: "Alimentaire & Boissons",
      location: "Abomey-Calavi, Arconville",
      contact_phone: "+22997000003"
    },
    images: [
      "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    _id: "prod-8",
    id: "prod-8",
    name: "Enceinte Portable Bluetooth Étanche",
    description: "Son puissant 360°, résistante à l'eau IPX7 avec 15h de lecture continue.",
    price: 45000,
    shop_id: "shop-tech-1",
    shop: {
      id: "shop-tech-1",
      _id: "shop-tech-1",
      name: "Tech & Co Bénin",
      category: "Électronique & Multimédia",
      location: "Cotonou, Haie Vive",
      contact_phone: "+22997000001"
    },
    images: [
      "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80"
    ]
  }
];
