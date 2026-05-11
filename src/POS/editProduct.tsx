import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Coffee, Save, Check, Upload, Package, FlaskConical } from "lucide-react";
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
    type: "made-to-order" as "made-to-order" | "ready-made",
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
      <DialogContent className="sm:max-w-md bg-[#F5EFE6]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#1C1412]">
            <Coffee className="h-5 w-5 text-[#6B5B4E]" />
            Edit Product
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 py-4">
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <label className="text-[10px] font-bold uppercase text-[#9E8E7E] tracking-wider">Product Name</label>
              <Input
                value={editedItem.name}
                onChange={(e) => setEditedItem({ ...editedItem, name: e.target.value })}
                className="h-11 bg-white border-[#DDD5C8] text-[#1C1412] focus-visible:ring-[#C4B5A5]"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <label className="text-[10px] font-bold uppercase text-[#9E8E7E] tracking-wider">Category</label>
                <Select 
                  value={editedItem.category} 
                  onValueChange={(val) => setEditedItem({ ...editedItem, category: val })}
                >
                  <SelectTrigger className="h-11 bg-white border-[#DDD5C8] text-[#1C1412]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(c => c !== "All").map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <label className="text-[10px] font-bold uppercase text-[#9E8E7E] tracking-wider">Price (₱)</label>
                <Input
                  type="number"
                  value={editedItem.price}
                  onChange={(e) => setEditedItem({ ...editedItem, price: e.target.value })}
                  className="h-11 bg-white border-[#DDD5C8] text-[#1C1412] font-black"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 items-end">
               <div className="grid gap-1.5">
                  <label className="text-[10px] font-bold uppercase text-[#9E8E7E] tracking-wider">Status</label>
                  <Button
                    variant="outline"
                    className={`h-11 w-full text-[10px] font-bold uppercase tracking-wider transition-all border-[#DDD5C8] ${
                      editedItem.inStock 
                        ? "bg-white text-[#1C1412] hover:bg-green-50" 
                        : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                    }`}
                    onClick={() => setEditedItem({ ...editedItem, inStock: !editedItem.inStock })}
                  >
                    {editedItem.inStock ? "In Stock" : "Out of Stock"}
                  </Button>
               </div>
               <div className="grid gap-1.5">
                  <label className="text-[10px] font-bold uppercase text-[#9E8E7E] tracking-wider">Image</label>
                  <Button 
                    variant="outline" 
                    className={`h-11 w-full gap-2 border-dashed border-[#C4B5A5] text-[#6B5B4E] text-xs hover:bg-[#E8DFD3]/50 ${editedItem.image ? "border-[#6B5B4E] text-[#1C1412]" : ""}`}
                    onClick={() => document.getElementById('edit-image-upload')?.click()}
                  >
                    {editedItem.image ? <Check className="h-3 w-3" /> : <Upload className="h-3 w-3" />}
                    {editedItem.image ? "Change" : "Upload"}
                  </Button>
                  <input id="edit-image-upload" type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
               </div>
            </div>

            <div className="space-y-2 mt-2">
              <label className="text-[10px] font-bold uppercase text-[#9E8E7E] tracking-wider">Stocking Method</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setEditedItem({ ...editedItem, type: "made-to-order" })}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all gap-1 ${
                    editedItem.type === "made-to-order" 
                      ? "border-[#1C1412] bg-[#1C1412]/5 text-[#1C1412]" 
                      : "border-[#DDD5C8] text-[#9E8E7E] bg-white hover:bg-[#E8DFD3]/30"
                  }`}
                >
                  <FlaskConical className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase">Made-to-order</span>
                </button>

                <button
                  onClick={() => setEditedItem({ ...editedItem, type: "ready-made" })}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all gap-1 ${
                    editedItem.type === "ready-made" 
                      ? "border-[#1C1412] bg-[#1C1412]/5 text-[#1C1412]" 
                      : "border-[#DDD5C8] text-[#9E8E7E] bg-white hover:bg-[#E8DFD3]/30"
                  }`}
                >
                  <Package className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase">Ready-made</span>
                </button>
              </div>
            </div>

            {editedItem.type === 'made-to-order' ? (
              <div className="grid gap-2 p-4 bg-[#E8DFD3]/30 rounded-xl border border-[#D4C9BB]">
                <label className="text-[10px] font-bold uppercase text-[#9E8E7E] tracking-wider">Linked Recipe</label>
                <Select 
                  value={editedItem.recipeId || "none"} 
                  onValueChange={(val) => setEditedItem({ ...editedItem, recipeId: val === "none" ? "" : val })}
                >
                  <SelectTrigger className="h-10 bg-white border-[#DDD5C8] text-[#1C1412]">
                    <SelectValue placeholder="No Recipe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Manual Stock Management</SelectItem>
                    {recipes.map(r => (
                      <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 p-4 bg-[#E8DFD3]/30 rounded-xl border border-[#D4C9BB]">
                <div className="grid gap-1.5">
                  <label className="text-[10px] font-bold uppercase text-[#9E8E7E] tracking-wider">Current Qty</label>
                  <Input 
                    type="number" 
                    value={editedItem.quantity} 
                    onChange={(e) => setEditedItem({ ...editedItem, quantity: e.target.value })}
                    className="h-10 bg-white border-[#DDD5C8]"
                  />
                </div>
                <div className="grid gap-1.5">
                  <label className="text-[10px] font-bold uppercase text-[#9E8E7E] tracking-wider">Alert At</label>
                  <Input 
                    type="number" 
                    value={editedItem.lowStockThreshold} 
                    onChange={(e) => setEditedItem({ ...editedItem, lowStockThreshold: e.target.value })}
                    className="h-10 bg-white border-[#DDD5C8]"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="bg-[#E8DFD3]/20 p-4 -mx-6 -mb-6 border-t border-[#D4C9BB]">
          <Button variant="ghost" className="text-[#6B5B4E] hover:bg-[#E8DFD3]" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button 
            onClick={handleSave} 
            disabled={!editedItem.name || !editedItem.price}
            className="bg-[#1C1412] text-white hover:bg-[#2C2018] rounded-full px-6 font-bold"
          >
            <Save className="h-4 w-4 mr-2" /> Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

