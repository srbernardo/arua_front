import ProductCard from "./ProductCard";
import type { Product } from "../types";

interface ProductGridProps {
  products: Product[];
  defaultColor?: string;
  onProductClick?: (product: Product) => void;
}

export default function ProductGrid({ products, defaultColor, onProductClick }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="font-body text-sm text-foreground-secondary/60">
          Nenhum produto encontrado
        </span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 w-full">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} defaultColor={defaultColor} onClick={() => onProductClick?.(product)} />
      ))}
    </div>
  );
}
