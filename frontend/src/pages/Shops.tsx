
import ShopCard from "@/components/ShopCard";
import { shops } from "@/data";
import { Link } from "react-router-dom";

const Shops = () => {
  return (
    <div className="container py-16 md:py-24">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-10">Nos Boutiques</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {shops.map((shop, index) => (
          <div key={shop.id} className="animate-fade-in-up" style={{ animationDelay: `${0.2 + index * 0.1}s` }}>
            <Link to={`/shops/${shop.id}`}>
              <ShopCard {...shop} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Shops;
