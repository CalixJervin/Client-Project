import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Coffee, Save, Image as ImageIcon } from "lucide-react";
import type { Product } from "@/hooks/useCart";
import { useInventory } from "@/hooks/useInventory";

interface EditProductModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  categories: string[];
  onSave: (updatedProduct: Product) => void;
}

export function EditProductModal({ isOpen, onOpenChange, product, categories, onSave }: EditProductModalProps) {
  const { recipes } = useInventory();
  const [editedItem, setEditedItem] = useState({ 
    name: "", 
    category: "", 
    price: "", 
    recipeId: "", 
    image: "", 
    inStock: true 
  });

  useEffect(() => {
    if (product) {
      setEditedItem({
        name: product.name,
        category: product.category,
        price: product.price.toString(),
        recipeId: product.recipeId || "",
        image: product.image || "",
        inStock: product.inStock
      });
    }
  }, [product]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setEditedItem({ ...editedItem, image: imageUrl });
    }
  };

  const handleSave = () => {
    if (!product || !editedItem.name || !editedItem.price) return;
    onSave({
      ...product,
      name: editedItem.name,
      category: editedItem.category,
      price: Number(editedItem.price),
      recipeId: editedItem.recipeId || undefined,
      image: editedItem.image,
      inStock: editedItem.inStock,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coffee className="h-5 w-5" />
            Edit Product
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-5 py-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase text-muted-foreground">Product Name</label>
              <Input
                value={editedItem.name}
                onChange={(e) => setEditedItem({ ...editedItem, name: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase text-muted-foreground">Category</label>
                <select
                  value={editedItem.category}
                  onChange={(e) => setEditedItem({ ...editedItem, category: e.target.value })}
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
                  value={editedItem.price}
                  onChange={(e) => setEditedItem({ ...editedItem, price: e.target.value })}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase text-muted-foreground">Linked Recipe (Optional)</label>
              <select
                value={editedItem.recipeId}
                onChange={(e) => setEditedItem({ ...editedItem, recipeId: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">No Recipe</option>
                {recipes.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase text-muted-foreground">Product Image</label>
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 rounded-lg overflow-hidden border bg-muted flex items-center justify-center">
                  {editedItem.image ? (
                    <img src={editedItem.image} className="h-full w-full object-cover" alt="Preview" />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                  )}
                </div>
                <Input type="file" accept="image/*" onChange={handleImageUpload} className="flex-1 cursor-pointer" />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
              <span className="text-sm font-medium">In Stock</span>
              <Button
                variant={editedItem.inStock ? "outline" : "destructive"}
                size="sm"
                className="h-8 px-3 text-[10px] font-bold uppercase tracking-wider"
                onClick={() => setEditedItem({ ...editedItem, inStock: !editedItem.inStock })}
              >
                {editedItem.inStock ? "In Stock" : "Out of Stock"}
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!editedItem.name || !editedItem.price}>
            <Save className="h-4 w-4 mr-2" /> Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
