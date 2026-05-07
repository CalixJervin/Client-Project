// POS/editProduct.tsx
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Product } from "@/hooks/useCart";

interface EditProductModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  categories: string[];
  onSave: (updatedProduct: Product) => void;
}

export function EditProductModal({ isOpen, onOpenChange, product, categories, onSave }: EditProductModalProps) {
  const [editedItem, setEditedItem] = useState({ name: "", price: "", category: "", image: "" });

  useEffect(() => {
    if (product) {
      setEditedItem({
        name: product.name,
        price: product.price.toString(),
        category: product.category,
        image: product.image || "", 
      });
    }
  }, [product]);

  const handleSave = () => {
    if (!product || !editedItem.name || !editedItem.price) return;
    onSave({
      ...product,
      name: editedItem.name,
      price: Number(editedItem.price),
      category: editedItem.category,
      image: editedItem.image,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Edit Product</DialogTitle></DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Product Name</label>
            <Input value={editedItem.name} onChange={(e) => setEditedItem({ ...editedItem, name: e.target.value })} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Price (₱)</label>
            <Input type="number" value={editedItem.price} onChange={(e) => setEditedItem({ ...editedItem, price: e.target.value })} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Category</label>
            <select
              value={editedItem.category}
              onChange={(e) => setEditedItem({ ...editedItem, category: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!editedItem.name || !editedItem.price}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}