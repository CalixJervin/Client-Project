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
import { Plus, Coffee, Save, Image as ImageIcon } from "lucide-react";
import type { Product } from "@/hooks/useCart";
import { useInventory } from "@/hooks/useInventory";

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
  const { recipes } = useInventory();
  
  const [newItem, setNewItem] = useState({
    name: "",
    category: "Hot Coffee",
    price: "",
    recipeId: "",
    image: "",
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setNewItem({ ...newItem, image: imageUrl });
    }
  };

  const handleSave = () => {
    if (!newItem.name || !newItem.price) {
      toast.error("Please enter a name and price");
      return;
    }

    const product: Product = {
      id: Date.now(),
      name: newItem.name,
      category: newItem.category,
      price: Number(newItem.price),
      recipeId: newItem.recipeId || undefined,
      image: newItem.image || "https://images.unsplash.com/photo-1541167760496-162955ed8a9f?w=500&q=80",
      inStock: true,
    };

    onAddProduct(product);
    toast.success(`${newItem.name} added successfully`);
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setNewItem({
      name: "",
      category: "Hot Coffee",
      price: "",
      recipeId: "",
      image: "",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) resetForm();
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Product
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5 py-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase text-muted-foreground">Product Name</label>
              <Input
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                placeholder="e.g. Spanish Latte"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase text-muted-foreground">Category</label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {categories.filter(c => c !== "All").map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase text-muted-foreground">Price (₱)</label>
                <Input
                  type="number"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase text-muted-foreground">Linked Recipe (Optional)</label>
              <select
                value={newItem.recipeId}
                onChange={(e) => setNewItem({ ...newItem, recipeId: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">No Recipe (No Auto-Deduction)</option>
                {recipes.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase text-muted-foreground">Product Image</label>
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 rounded-lg overflow-hidden border bg-muted flex items-center justify-center">
                  {newItem.image ? (
                    <img src={newItem.image} className="h-full w-full object-cover" alt="Preview" />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                  )}
                </div>
                <Input type="file" accept="image/*" onChange={handleImageUpload} className="flex-1 cursor-pointer" />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!newItem.name || !newItem.price}>
            <Save className="h-4 w-4 mr-2" /> Save Product
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
