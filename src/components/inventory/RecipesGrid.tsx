import { useState } from "react";
import type { Recipe, Ingredient, Product } from "@/types/inventory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Edit, 
  Trash2
} from "lucide-react";
import { toast } from "sonner";
import { RecipeBuilder } from "./RecipeBuilder";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface RecipesGridProps {
  recipes: Recipe[];
  ingredients: Ingredient[];
  products: Product[];
  onAdd: (data: Omit<Recipe, 'id'>) => void;
  onUpdate: (id: string, data: Partial<Recipe>) => void;
  onDelete: (id: string) => void;
}

export function RecipesGrid({
  recipes,
  ingredients,
  products,
  onAdd,
  onUpdate,
  onDelete
}: RecipesGridProps) {
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);

  const getProductsUsingRecipe = (recipeId: string) => {
    return products.filter(p => p.variants.some(v => v.recipeId === recipeId));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe) => {
          const usedIn = getProductsUsingRecipe(recipe.id);
          return (
            <Card key={recipe.id} className="group hover:shadow-lg transition-all border-muted/60">
              <CardHeader className="p-4 border-b bg-muted/10 group-hover:bg-muted/20 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-bold">{recipe.name}</CardTitle>
                    <Badge variant="outline" className="mt-1">Yield: {recipe.yield}</Badge>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => {
                        setEditingRecipe(recipe);
                        setIsBuilderOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => onDelete(recipe.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div>
                  <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-2 flex items-center gap-1">
                    Ingredients
                  </div>
                  <ul className="space-y-2">
                    {recipe.ingredients.map((ri, idx) => {
                      const ing = ingredients.find(i => i.id === ri.ingredientId);
                      return (
                        <li key={idx} className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">{ing?.name || "Unknown"}</span>
                          <span className="font-semibold">{ri.quantity} {ing?.unit}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {usedIn.length > 0 && (
                  <div className="pt-3 border-t">
                    <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-2">
                      Used In
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {usedIn.map(p => (
                        <Badge key={p.id} variant="secondary" className="text-[10px] font-medium">
                          {p.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        <Button 
          variant="outline" 
          className="h-full min-h-[200px] border-dashed border-2 flex flex-col gap-4 text-muted-foreground hover:text-primary hover:border-primary hover:bg-primary/5 transition-all group"
          onClick={() => {
            setEditingRecipe(null);
            setIsBuilderOpen(true);
          }}
        >
          <div className="h-12 w-12 rounded-full border-2 border-dashed flex items-center justify-center group-hover:scale-110 transition-transform">
            <Plus className="h-6 w-6" />
          </div>
          <div className="text-center">
            <p className="font-bold">Create New Recipe</p>
            <p className="text-xs">Reusable across multiple products</p>
          </div>
        </Button>
      </div>

      <Dialog open={isBuilderOpen} onOpenChange={setIsBuilderOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingRecipe ? "Edit Recipe" : "Create New Recipe"}</DialogTitle>
          </DialogHeader>
          <RecipeBuilder 
            ingredients={ingredients}
            initialData={editingRecipe || undefined}
            onSave={(data) => {
              if (editingRecipe) {
                onUpdate(editingRecipe.id, data);
                toast.success("Recipe updated");
              } else {
                onAdd(data);
                toast.success("Recipe created");
              }
              setIsBuilderOpen(false);
            }}
            onCancel={() => setIsBuilderOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
