// components/AddProductModal.tsx
import { toast } from "sonner";
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

interface AddProductModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddProduct: (product: Product) => void;
  categories: string[];
}

export function AddProductModal({
  isOpen,
  onOpenChange,
  onAddProduct,
  categories,
}: AddProductModalProps) {
  const [newItem, setNewItem] = useState({
    name: "",
    price: "",
    category: "Hot Coffee",
    image: "",
  });

  // NEW: Handler for the file upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Creates a temporary local URL for the uploaded file
      const imageUrl = URL.createObjectURL(file);
      setNewItem({ ...newItem, image: imageUrl });
    }
  };

  const handleAddNewItem = () => {
    if (!newItem.name || !newItem.price) return;

    const product: Product = {
      id: Date.now(),
      name: newItem.name,
      price: Number(newItem.price),
      category: newItem.category,
      image: newItem.image || "https://placehold.co/400x400/png",
    };

    onAddProduct(product);

    toast.success(`${newItem.name} added to menu`, {
      description: `Category: ${newItem.category} | Price: ₱${newItem.price}`,
    });
    
    setNewItem({ name: "", price: "", category: "Hot Coffee", image: "" });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Product Name</label>
            <Input
              value={newItem.name}
              onChange={(e) =>
                setNewItem({ ...newItem, name: e.target.value })
              }
              placeholder="e.g. Caramel Macchiato"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Price (₱)</label>
            <Input
              type="number"
              value={newItem.price}
              onChange={(e) =>
                setNewItem({ ...newItem, price: e.target.value })
              }
              placeholder="0.00"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Category</label>
            <select
              value={newItem.category}
              onChange={(e) =>
                setNewItem({ ...newItem, category: e.target.value })
              }
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {categories.filter(cat => cat !== "All").map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* CHANGED: Replaced text input with file input and preview */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Product Image (Optional)</label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="cursor-pointer file:text-primary file:font-medium file:bg-muted file:border-0 file:rounded-md hover:file:bg-muted/80 file:transition-colors"
            />
            
            {/* NEW: Image Preview Box */}
            {newItem.image && (
              <div className="mt-2 relative w-full h-32 rounded-md overflow-hidden border border-border shadow-sm">
                <img 
                  src={newItem.image} 
                  alt="Preview" 
                  className="w-full h-full object-cover" 
                />
              </div>
            )}
          </div>
          
        </div>
        <DialogFooter className="sm:justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAddNewItem}
            disabled={!newItem.name || !newItem.price}
          >
            Save Item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}