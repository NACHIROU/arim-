import ShopCard from "@/components/ShopCard";
import { useEffect, useState } from "react";

interface Shop {
  id: string;
  name: string;
  description: string;
  category: string; // <-- AJOUT
  images?: string[];
}

const Shops = () => {
  const [shops, setShops] = useState<Shop[]>([]);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const response = await fetch("http://localhost:8000/shops/retrieve-all-shops/");
        const data = await response.json();
        setShops(data);
      } catch (error) {
        console.error("Erreur chargement boutiques :", error);
      }
    };

    fetchShops();
  }, []);

  return (
    <div className="container py-16 md:py-24">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-10">Nos Boutiques</h1>
      {shops.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {shops.map((shop) => (
            <div key={shop.id}>
              <ShopCard
                id={shop.id}
                imageUrl={shop.images?.[0] || "/default-shop.jpg"}
                name={shop.name}
                description={shop.description}
                category={shop.category} // <-- AJOUT
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center">Aucune boutique disponible.</p>
      )}
    </div>
  );
};

export default Shops;