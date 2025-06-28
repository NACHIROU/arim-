
import ProductCard from "@/components/ProductCard";
import { products, shops } from "@/data";

const Products = () => {
    return (
        <div className="container py-16 md:py-24">
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-10">Tous nos produits</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((product, index) => {
                    const shop = shops.find(s => s.name === product.seller);
                    return (
                        <div key={product.id} className="animate-fade-in-up" style={{ animationDelay: `${0.2 + index * 0.1}s` }}>
                            <ProductCard {...product} shopId={shop?.id} showShopLink />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Products;
