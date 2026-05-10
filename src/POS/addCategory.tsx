// components/AddCategoryModal.tsx
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Product } from "@/hooks/useCart";

interface AddCategoryModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddCategory: (name: string, selectedProductIds: string[]) => void;
  existingProducts: Product[];
  existingCategories: string[];
}
import { toast } from "sonner";

export function AddCategoryModal({
  isOpen,
  onOpenChange,
  onAddCategory,
  existingProducts,
  existingCategories,
}: AddCategoryModalProps) {
  const [categoryName, setCategoryName] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [error, setError] = useState("");
  

  // Toggle selection of products
  const toggleProduct = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    const trimmedName = categoryName.trim();
    
    // Validation
    if (!trimmedName) {
      setError("Category name is required");
      return;
    }
    if (existingCategories.some(c => c.toLowerCase() === trimmedName.toLowerCase())) {
      setError("This category already exists");
      return;
    }

    onAddCategory(trimmedName, selectedIds);

     toast.success(`Category "${categoryName}" created!`, {
     // description: `Moved ${selectedProductIds.length} items to this category.`
    })
    // Reset and close
    setCategoryName("");
    setSelectedIds([]);
    setError("");
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Category</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-6 py-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Category Name</label>
            <Input
              autoFocus
              value={categoryName}
              onChange={(e) => {
                setCategoryName(e.target.value);
                setError(""); // Clear error when typing
              }}
              placeholder="e.g. Seasonal Drinks"
            />
            {error && <span className="text-sm text-destructive">{error}</span>}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">
              Select Items for this Category ({selectedIds.length} selected)
            </label>
            <span className="text-xs text-muted-foreground mb-2">
              Items selected will be moved from their current category to this new one.
            </span>
            
            {/* Scrollable list of existing products */}
            <div className="max-h-[40vh] overflow-y-auto border rounded-md p-2 flex flex-col gap-2 bg-muted/30">
              {existingProducts.length === 0 ? (
                <p className="text-sm text-center py-4 text-muted-foreground">No products available.</p>
              ) : (
                existingProducts.map((product) => {
                  const isSelected = selectedIds.includes(product.id);
                  return (
                    <div
                      key={product.id}
                      onClick={() => toggleProduct(product.id)}
                      className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-all border ${
                        isSelected 
                          ? "bg-primary/10 border-primary" 
                          : "bg-background border-transparent hover:border-border"
                      }`}
                    >
                      <div className="h-10 w-10 rounded overflow-hidden shrink-0">
                        <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1 flex flex-col">
                        <span className="text-sm font-medium leading-tight">{product.name}</span>
                        <span className="text-xs text-muted-foreground">{product.category}</span>
                      </div>
                      {/* Custom Checkbox UI indicator */}
                      <div className={`h-5 w-5 rounded border flex items-center justify-center shrink-0 ${isSelected ? "bg-primary border-primary" : "border-muted-foreground/50"}`}>
                        {isSelected && <span className="text-primary-foreground text-xs font-bold">✓</span>}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter className="sm:justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Create Category
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}