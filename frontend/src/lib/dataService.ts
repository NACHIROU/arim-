import { Boutique, Produit } from '@/types';
import { INITIAL_SHOPS, INITIAL_PRODUCTS } from './initialData';

const SHOPS_CACHE_KEY = 'ahimin_cached_shops';
const PRODUCTS_CACHE_KEY = 'ahimin_cached_products';

export const dataService = {
  getInitialShops(): Boutique[] {
    try {
      const cached = localStorage.getItem(SHOPS_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Erreur lecture cache boutiques:", e);
    }
    return INITIAL_SHOPS;
  },

  getInitialProducts(): Produit[] {
    try {
      const cached = localStorage.getItem(PRODUCTS_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Erreur lecture cache produits:", e);
    }
    return INITIAL_PRODUCTS;
  },

  async syncShops(onSuccess?: (shops: Boutique[]) => void): Promise<Boutique[]> {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      if (!baseUrl) return INITIAL_SHOPS;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

      const response = await fetch(`${baseUrl}/shops/public-shops/`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          localStorage.setItem(SHOPS_CACHE_KEY, JSON.stringify(data));
          if (onSuccess) onSuccess(data);
          return data;
        }
      }
    } catch (err) {
      console.info("Synchronisation API boutiques en attente (utilisation des données locales).");
    }
    return this.getInitialShops();
  },

  async syncProducts(onSuccess?: (products: Produit[]) => void): Promise<Produit[]> {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      if (!baseUrl) return INITIAL_PRODUCTS;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

      const response = await fetch(`${baseUrl}/products/public-products/`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(data));
          if (onSuccess) onSuccess(data);
          return data;
        }
      }
    } catch (err) {
      console.info("Synchronisation API produits en attente (utilisation des données locales).");
    }
    return this.getInitialProducts();
  },

  findProductById(id: string): Produit | undefined {
    const products = this.getInitialProducts();
    return products.find(p => p._id === id || p.id === id);
  },

  findShopById(id: string): Boutique | undefined {
    const shops = this.getInitialShops();
    return shops.find(s => s._id === id);
  }
};
