import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Coffee, Save, Check, Upload } from "lucide-react";
import { useInventory } from "@/hooks/useInventory";

interface EditProductModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product: any | null; // Accepting Inventory Product structure
  categories: string[];
  onSave: (updatedProduct: any) => void;
}

export function EditProductModal({ isOpen, onOpenChange, product, categories, onSave }: EditProductModalProps) {
  const { recipes } = useInventory();
  const [editedItem, setEditedItem] = useState({ 
    name: "", 
    category: "", 
    price: "", 
    recipeId: "", 
    image: "", 
    inStock: true,
    type: "made-to-order",
    quantity: "0",
    lowStockThreshold: "5"
  });

  useEffect(() => {
    if (product) {
      setEditedItem({
        name: product.name,
        category: product.category,
        price: (product.variants?.[0]?.price || 0).toString(),
        recipeId: product.variants?.[0]?.recipeId || "",
        image: product.image || "",
        inStock: product.inStock,
        type: product.type || "made-to-order",
        quantity: (product.quantity || 0).toString(),
        lowStockThreshold: (product.lowStockThreshold || 0).toString()
      });
    }
  }, [product, isOpen]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedItem({ ...editedItem, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!product || !editedItem.name || !editedItem.price) return;
    
    onSave({
      id: product.id,
      name: editedItem.name,
      category: editedItem.category,
      price: Number(editedItem.price),
      recipeId: editedItem.recipeId || null,
      image: editedItem.image,
      inStock: editedItem.inStock,
      type: editedItem.type,
      quantity: Number(editedItem.quantity),
      lowStockThreshold: Number(editedItem.lowStockThreshold)
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
        
        <div className="flex flex-col gap-4 py-4">
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Product Name</label>
              <Input
                value={editedItem.name}
                onChange={(e) => setEditedItem({ ...editedItem, name: e.target.value })}
                className="h-10"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Category</label>
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
              <div className="grid gap-1.5">
                <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Price (₱)</label>
                <Input
                  type="number"
                  value={editedItem.price}
                  onChange={(e) => setEditedItem({ ...editedItem, price: e.target.value })}
                  className="h-10 font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 items-end">
               <div className="grid gap-1.5">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Status</label>
                  <Button
                    variant={editedItem.inStock ? "outline" : "destructive"}
                    size="sm"
                    className="h-10 px-3 text-[10px] font-bold uppercase tracking-wider w-full"
                    onClick={() => setEditedItem({ ...editedItem, inStock: !editedItem.inStock })}
                  >
                    {editedItem.inStock ? "In Stock" : "Out of Stock"}
                  </Button>
               </div>
               <div className="grid gap-1.5">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Image</label>
                  <Button 
                    variant="outline" 
                    className={`h-10 w-full gap-2 border-dashed text-xs ${editedItem.image ? "border-primary text-primary" : ""}`}
                    onClick={() => document.getElementById('edit-image-upload')?.click()}
                  >
                    {editedItem.image ? <Check className="h-3 w-3" /> : <Upload className="h-3 w-3" />}
                    {editedItem.image ? "Change" : "Upload"}
                  </Button>
                  <input id="edit-image-upload" type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
               </div>
            </div>

            {editedItem.type === 'made-to-order' ? (
              <div className="grid gap-1.5 p-3 bg-muted/30 rounded-lg border">
                <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Linked Recipe</label>
                <select
                  value={editedItem.recipeId}
                  onChange={(e) => setEditedItem({ ...editedItem, recipeId: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
                >
                  <option value="">No Recipe</option>
                  {recipes.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 p-3 bg-muted/30 rounded-lg border">
                <div className="grid gap-1.5">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Current Qty</label>
                  <Input 
                    type="number" 
                    value={editedItem.quantity} 
                    onChange={(e) => setEditedItem({ ...editedItem, quantity: e.target.value })}
                    className="h-9 text-xs bg-white"
                  />
                </div>
                <div className="grid gap-1.5">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Alert At</label>
                  <Input 
                    type="number" 
                    value={editedItem.lowStockThreshold} 
                    onChange={(e) => setEditedItem({ ...editedItem, lowStockThreshold: e.target.value })}
                    className="h-9 text-xs bg-white"
                  />
                </div>
              </div>
            )}
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
