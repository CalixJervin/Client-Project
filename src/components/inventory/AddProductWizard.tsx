import { useState, useRef } from "react";
import type { 
  Ingredient, 
  Recipe, 
  Product, 
  ProductCategory, 
  ProductAvailability,
  ProductVariant
} from "@/types/inventory";
import { Badge } from "@/components/ui/badge";
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
  Image as ImageIcon
} from "lucide-react";
import { RecipeBuilder } from "./RecipeBuilder";
import { toast } from "sonner";

interface AddProductWizardProps {
  ingredients: Ingredient[];
  recipes: Recipe[];
  onComplete: (data: Omit<Product, 'id'>) => void;
  onCancel: () => void;
  onAddRecipe: (data: Omit<Recipe, 'id'>) => string;
}

export function AddProductWizard({
  ingredients,
  recipes,
  onComplete,
  onCancel,
  onAddRecipe
}: AddProductWizardProps) {
  const [step, setStep] = useState(1);
  const [showInlineRecipeBuilder, setShowInlineRecipeBuilder] = useState(false);
  
  // Product state
  const [name, setName] = useState("");
  const [category, setCategory] = useState<ProductCategory>("Drinks");
  const [availability, setAvailability] = useState<ProductAvailability>("all-day");
  const [price, setPrice] = useState("");
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
    if (step === 1 && !name) {
      toast.error("Please enter a product name");
      return;
    }
    if (step === 2 && (!price || Number(price) <= 0)) {
      toast.error("Please enter a valid price");
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSave = () => {
    const productData: Omit<Product, 'id'> = {
      name,
      category,
      availability,
      variants: [
        {
          size: "Regular",
          price: Number(price),
          recipeId: recipeId
        }
      ],
      image,
      inStock: true
    };
    onComplete(productData);
  };

  const handleAddInlineRecipe = (recipeData: Omit<Recipe, 'id'>) => {
    const newId = onAddRecipe(recipeData);
    setRecipeId(newId);
    setShowInlineRecipeBuilder(false);
    toast.success("New recipe created and linked!");
  };

  return (
    <div className="flex flex-col h-[500px]">
      {/* Progress Bar */}
      <div className="flex border-b">
        {[1, 2, 3, 4].map((i) => (
          <div 
            key={i} 
            className={`flex-1 h-1 ${i <= step ? "bg-primary" : "bg-muted"} transition-colors`}
          />
        ))}
      </div>

      <div className="flex-1 p-8 overflow-auto">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
              <h2 className="text-xl font-bold">General Information</h2>
              <p className="text-sm text-muted-foreground">Start with the basics of your new product.</p>
            </div>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Product Name</label>
                <Input 
                  placeholder="e.g. Signature Latte" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Category</label>
                  <Select value={category} onValueChange={(val) => setCategory(val as ProductCategory)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Drinks">Drinks</SelectItem>
                      <SelectItem value="Food">Food</SelectItem>
                      <SelectItem value="Pastries">Pastries</SelectItem>
                      <SelectItem value="Add-ons">Add-ons</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Availability</label>
                  <Select value={availability} onValueChange={(val) => setAvailability(val as ProductAvailability)}>
                    <SelectTrigger>
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
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
              <h2 className="text-xl font-bold">Pricing & Recipe</h2>
              <p className="text-sm text-muted-foreground">Set your price and link how it's made.</p>
            </div>
            
            {showInlineRecipeBuilder ? (
              <div className="border rounded-lg p-4 bg-muted/30">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold">Inline Recipe Builder</h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowInlineRecipeBuilder(false)}>
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
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Price (₱)</label>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    value={price} 
                    onChange={(e) => setPrice(e.target.value)} 
                    className="text-2xl font-bold h-12"
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Linked Recipe</label>
                    <Button 
                      variant="link" 
                      className="h-auto p-0 text-xs" 
                      onClick={() => setShowInlineRecipeBuilder(true)}
                    >
                      <Plus className="h-3 w-3 mr-1" /> Create New Recipe
                    </Button>
                  </div>
                  <Select 
                    value={recipeId || "none"} 
                    onValueChange={(val) => setRecipeId(val === "none" ? null : val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select existing recipe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Recipe (Manual Stock)</SelectItem>
                      {recipes.map(r => (
                        <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
              <h2 className="text-xl font-bold">Product Image</h2>
              <p className="text-sm text-muted-foreground">A visual representation for the POS grid.</p>
            </div>
            
            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 bg-muted/20 min-h-[200px] transition-colors hover:bg-muted/30">
              {image ? (
                <div className="relative group">
                  <img src={image} className="h-40 w-40 object-cover rounded-lg border shadow-md" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                    <Button size="sm" variant="secondary" onClick={() => fileInputRef.current?.click()}>Change</Button>
                    <Button size="sm" variant="destructive" onClick={() => setImage(null)}>Remove</Button>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mx-auto">
                    <ImageIcon className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <div>
                    <Button onClick={() => fileInputRef.current?.click()} variant="outline">
                      <Upload className="h-4 w-4 mr-2" /> Upload Image
                    </Button>
                    <p className="text-[10px] text-muted-foreground mt-2">JPG, PNG or WEBP. Max 2MB.</p>
                  </div>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageUpload} 
              />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
              <h2 className="text-xl font-bold">Review & Save</h2>
              <p className="text-sm text-muted-foreground">Review your product details before finishing.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-6 bg-muted/30 p-6 rounded-xl border">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold uppercase text-muted-foreground block">Product Name</label>
                  <p className="font-bold text-lg">{name}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-muted-foreground block">Category</label>
                  <Badge variant="outline">{category}</Badge>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-muted-foreground block">Price</label>
                  <p className="font-bold text-xl text-primary">₱{price}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold uppercase text-muted-foreground block">Linked Recipe</label>
                  <p className="text-sm">{recipeId ? recipes.find(r => r.id === recipeId)?.name : "None"}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-muted-foreground block">Availability</label>
                  <p className="text-sm capitalize">{availability.replace("-", " ")}</p>
                </div>
                {image && (
                  <img src={image} className="h-16 w-16 object-cover rounded border" />
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 border-t bg-muted/10 flex justify-between items-center">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <div className="flex gap-2">
          {step > 1 && (
            <Button variant="outline" onClick={handleBack}>
              <ChevronLeft className="h-4 w-4 mr-2" /> Back
            </Button>
          )}
          {step < 4 ? (
            <Button onClick={handleNext}>
              Next <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
              <Check className="h-4 w-4 mr-2" /> Save Product
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
