import { useState, useRef } from "react";
import type { 
  Ingredient, 
  Recipe, 
  Product, 
  ProductAvailability,
  ProductType
} from "@/types/inventory";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  ChevronRight, 
  ChevronLeft, 
  Upload, 
  Plus, 
  Check, 
  X,
  Package,
  FlaskConical
} from "lucide-react";
import { RecipeBuilder } from "./RecipeBuilder";
import { toast } from "sonner";

interface AddProductWizardProps {
  ingredients: Ingredient[];
  recipes: Recipe[];
  categories: string[];
  onComplete: (data: Omit<Product, 'id'>) => Promise<void>;
  onAddRecipe: (data: Omit<Recipe, 'id'>) => Promise<string | undefined>;
}

export function AddProductWizard({
  ingredients,
  recipes,
  categories,
  onComplete,
  onAddRecipe
}: AddProductWizardProps) {
  const [step, setStep] = useState(1);
  const [showInlineRecipeBuilder, setShowInlineRecipeBuilder] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Product state
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>(() => {
    const validCategories = categories.filter(c => c !== "All");
    return validCategories[0] || "Uncategorized";
  });
  const [availability, setAvailability] = useState<ProductAvailability>("all-day");
  const [type, setType] = useState<ProductType>("made-to-order");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [lowStockThreshold, setLowStockThreshold] = useState("");
  const [recipeId, setRecipeId] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!name) {
        toast.error("Please enter a product name");
        return;
      }
      setStep(2);
    }
  };

  const handleSave = async () => {
    if (!price || Number(price) <= 0) {
      toast.error("Please enter a valid price");
      return;
    }
    if (type === 'ready-made' && (!quantity || Number(quantity) < 0)) {
      toast.error("Please enter starting quantity");
      return;
    }

    setIsSaving(true);
    try {
      const productData: Omit<Product, 'id'> = {
        name,
        category,
        type,
        availability,
        variants: [
          {
            id: "", // Placeholder, Supabase will generate this or we can generate it
            size: "Regular",
            price: Number(price),
            recipeId: type === 'made-to-order' ? recipeId : null
          }
        ],
        image: image || "https://placehold.co/600x600/e2e8f0/64748b?text=No+Image",
        inStock: true,
        ...(type === 'ready-made' ? {
          quantity: Number(quantity),
          lowStockThreshold: Number(lowStockThreshold) || 0,
          restockLog: []
        } : {})
      };
      await onComplete(productData);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddInlineRecipe = async (recipeData: Omit<Recipe, 'id'>) => {
    setIsSaving(true);
    try {
      const newId = await onAddRecipe(recipeData);
      if (newId) {
        setRecipeId(newId);
        setShowInlineRecipeBuilder(false);
        toast.success("New recipe created and linked!");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col max-h-[85vh]">
      <div className="flex-1 p-6 overflow-y-auto">
        {step === 1 ? (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid gap-4">
              <div className="grid gap-1.5">
                <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Product Name</label>
                <Input 
                  placeholder="e.g. Signature Latte" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-1.5">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Category</label>
                  <Select value={category} onValueChange={(val) => setCategory(val)}>
                    <SelectTrigger className="h-11">
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
                  <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Availability</label>
                  <Select value={availability} onValueChange={(val) => setAvailability(val as ProductAvailability)}>
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-day">All Day</SelectItem>
                      <SelectItem value="morning">Morning Only</SelectItem>
                      <SelectItem value="weekend">Weekends Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Stocking Method</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setType("made-to-order")}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all gap-2 ${
                      type === "made-to-order" 
                        ? "border-primary bg-primary/5 text-primary shadow-sm" 
                        : "border-muted text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    <FlaskConical className="h-5 w-5" />
                    <span className="text-xs font-bold">Made-to-order</span>
                  </button>

                  <button
                    onClick={() => setType("ready-made")}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all gap-2 ${
                      type === "ready-made" 
                        ? "border-primary bg-primary/5 text-primary shadow-sm" 
                        : "border-muted text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    <Package className="h-5 w-5" />
                    <span className="text-xs font-bold">Ready-made</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid gap-5">
              <div className="grid grid-cols-2 gap-4 items-end">
                <div className="grid gap-1.5">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Price (₱)</label>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    value={price} 
                    onChange={(e) => setPrice(e.target.value)} 
                    className="h-11 text-lg font-black"
                  />
                </div>
                
                <div className="grid gap-1.5">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Product Image</label>
                  <Button 
                    variant="outline" 
                    className={`h-11 w-full gap-2 border-dashed ${image ? "border-primary text-primary" : ""}`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {image ? <Check className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
                    {image ? "Image Selected" : "Upload Image"}
                  </Button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                </div>
              </div>

              {type === 'made-to-order' ? (
                <div className="grid gap-2 p-4 bg-muted/30 rounded-xl border">
                  {showInlineRecipeBuilder ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center gap-2 flex-wrap">
                        <h3 className="text-xs font-bold uppercase">Recipe Builder</h3>
                        <Button variant="ghost" size="sm" onClick={() => setShowInlineRecipeBuilder(false)} className="h-6 w-6 p-0">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <RecipeBuilder 
                        ingredients={ingredients}
                        onSave={handleAddInlineRecipe}
                        onCancel={() => setShowInlineRecipeBuilder(false)}
                      />
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Linked Recipe</label>
                        <Button 
                          variant="link" 
                          className="h-auto p-0 text-[10px] font-bold" 
                          onClick={() => setShowInlineRecipeBuilder(true)}
                        >
                          <Plus className="h-3 w-3 mr-1" /> New Recipe
                        </Button>
                      </div>
                      <Select 
                        value={recipeId || "none"} 
                        onValueChange={(val) => setRecipeId(val === "none" ? null : val)}
                      >
                        <SelectTrigger className="h-10 bg-white">
                          <SelectValue placeholder="Select existing recipe" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Manual Stock Management</SelectItem>
                          {recipes.map(r => (
                            <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-xl border">
                  <div className="grid gap-1.5">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Start Qty</label>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      value={quantity} 
                      onChange={(e) => setQuantity(e.target.value)}
                      className="bg-white"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Alert At</label>
                    <Input 
                      type="number" 
                      placeholder="5" 
                      value={lowStockThreshold} 
                      onChange={(e) => setLowStockThreshold(e.target.value)}
                      className="bg-white"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t bg-muted/10 flex justify-between items-center">
        <div className="flex items-center gap-1.5">
           <div className={`h-1.5 w-6 rounded-full ${step === 1 ? "bg-primary" : "bg-muted"}`} />
           <div className={`h-1.5 w-6 rounded-full ${step === 2 ? "bg-primary" : "bg-muted"}`} />
        </div>
        
        <div className="flex gap-2">
          {step === 2 && (
            <Button variant="ghost" onClick={() => setStep(1)} size="sm">
              <ChevronLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          )}
          {step === 1 ? (
            <Button onClick={handleNext} className="min-w-[100px]" disabled={isSaving}>
              Continue <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSave} className="min-w-[120px]" disabled={isSaving}>
              {isSaving ? "Saving..." : <><Check className="h-4 w-4 mr-1" /> Save Product</>}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
