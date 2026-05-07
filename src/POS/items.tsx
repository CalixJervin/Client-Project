// components/ProductGrid.tsx
import { Plus, Trash2 } from "lucide-react";
import type { Product } from "@/hooks/useCart";

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onDeleteProduct: (id: number, name: string) => void;
  selectedProductId: number | null;
  onAddNewClick: () => void;
}

export function ProductGrid({
  products,
  onAddToCart,
  selectedProductId,
  onDeleteProduct,
  onAddNewClick,
}: ProductGridProps) {
  return (
    <div className="grid auto-rows-min gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {products.map((product) => (
        <div
          key={product.id}
          onClick={() => onAddToCart(product)}
          // We use backticks ` ` here to allow the dynamic ${} logic
          className={`group relative aspect-square rounded-xl overflow-hidden cursor-pointer shadow-sm transition-all duration-150 border-2 ${
            selectedProductId === product.id 
              ? "border-primary scale-95 opacity-80 z-10" 
              : "border-border/50 hover:border-primary/50"
          }`}
        >
          <img
            src={product.image}
            alt={product.name}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
          
          {/* Delete Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteProduct(product.id, product.name);
            }}
            className="absolute top-2 right-2 z-10 p-1.5 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-destructive hover:scale-100"
          >
            <Trash2 className="h-4 w-4" />
          </button>

          <div className="absolute bottom-0 w-full p-3 flex flex-col gap-1 text-white pointer-events-none">
            <div className="flex justify-between items-start gap-2">
              <span className="font-semibold text-sm leading-tight truncate">{product.name}</span>
              <span className="font-bold text-sm shrink-0">₱{product.price}</span>
            </div>
            <span className="text-xs text-gray-300 font-medium">{product.category}</span>
          </div>
        </div>
      ))}

      {/* Add New Item Button */}
      <button 
        onClick={onAddNewClick}
        className="aspect-square rounded-xl border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary hover:bg-muted/20 transition-all cursor-pointer"
      >
        <Plus className="h-8 w-8" />
        <span className="text-sm font-medium">Add New Item</span>
      </button>
    </div>
  );
}