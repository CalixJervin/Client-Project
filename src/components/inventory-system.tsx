import { useState, useMemo } from "react";
import { useInventory } from "@/hooks/useInventory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Package, 
  UtensilsCrossed, 
  Coffee, 
  AlertTriangle,
  Search,
  Plus
} from "lucide-react";
import { InventoryTable, type InventoryItem } from "./inventory/InventoryTable";
import { RecipesGrid } from "./inventory/RecipesGrid";
import { ProductsGrid } from "./inventory/ProductsGrid";
import { AddProductWizard } from "./inventory/AddProductWizard";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function InventorySystem() {
  const {
    ingredients,
    recipes,
    products,
    addIngredient,
    updateIngredient,
    restockIngredient,
    deleteIngredient,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    addProduct,
    restockProduct,
    deleteProduct,
    toggleProductStock,
  } = useInventory();

  const [activeTab, setActiveTab] = useState("products");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  // Combine ingredients and ready-made products for the inventory tracking view
  const inventoryItems = useMemo(() => {
    const ingItems: InventoryItem[] = ingredients.map(ing => ({
      id: ing.id,
      name: ing.name,
      type: 'made-to-order', // tracking for made-to-order products
      currentStock: ing.currentStock,
      unit: ing.unit,
      lowStockThreshold: ing.lowStockThreshold,
      status: ing.status,
      lastRestocked: ing.restockLog[0]?.date,
      originalType: 'ingredient'
    }));

    const readyMadeItems: InventoryItem[] = products
      .filter(p => p.type === 'ready-made')
      .map(p => {
        // Simple status calculation for ready-made
        const qty = p.quantity || 0;
        const threshold = p.lowStockThreshold || 0;
        let status: 'good' | 'low' | 'critical' | 'out' = 'good';
        if (qty === 0) status = 'out';
        else if (qty <= threshold * 0.25) status = 'critical';
        else if (qty <= threshold) status = 'low';

        return {
          id: p.id,
          name: p.name,
          type: 'ready-made',
          currentStock: qty,
          unit: 'pcs',
          lowStockThreshold: threshold,
          status: status,
          lastRestocked: p.restockLog?.[0]?.date,
          originalType: 'product'
        };
      });

    return [...ingItems, ...readyMadeItems];
  }, [ingredients, products]);

  const attentionNeeded = useMemo(() => 
    inventoryItems.filter(item => item.status !== "good"),
  [inventoryItems]);

  const filteredInventoryItems = useMemo(() => 
    inventoryItems.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase())),
  [inventoryItems, searchQuery]);

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6 h-full overflow-auto bg-background">
      {/* Alert Banner */}
      {attentionNeeded.length > 0 && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 animate-in fade-in slide-in-from-top-2">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <div className="flex-1 text-sm font-medium">
            {attentionNeeded.length} items need attention (Low, Critical, or Out).
          </div>
          <Button variant="outline" size="sm" className="bg-white hover:bg-red-50 border-red-200 text-red-800" onClick={() => setActiveTab("ingredients")}>
            Review Stock
          </Button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow order-2 md:order-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Stock Tracking</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryItems.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {attentionNeeded.length} needing attention
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow order-3 md:order-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Recipes</CardTitle>
            <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recipes.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Used across {products.filter(p => p.type === 'made-to-order').length} products
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow order-1 md:order-3">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle>
            <Coffee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {products.filter(p => !p.inStock).length} marked as out of stock
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="products" className="gap-2">Products</TabsTrigger>
            <TabsTrigger value="ingredients" className="gap-2">Ingredients</TabsTrigger>
            <TabsTrigger value="recipes" className="gap-2">Recipes</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search everything..."
                className="pl-9 h-10 bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {activeTab === "products" && (
              <Button onClick={() => setIsAddProductOpen(true)} className="h-10">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            )}
          </div>
        </div>

        <TabsContent value="products" className="mt-0">
          <ProductsGrid 
            products={products}
            recipes={recipes}
            onToggleStock={toggleProductStock}
            onDelete={deleteProduct}
          />
        </TabsContent>

        <TabsContent value="ingredients" className="mt-0">
          <Card>
            <CardContent className="pt-6">
              <InventoryTable 
                items={filteredInventoryItems} 
                onRestockIngredient={restockIngredient}
                onRestockProduct={restockProduct}
                onUpdateIngredient={updateIngredient}
                onDeleteIngredient={deleteIngredient}
                onDeleteProduct={deleteProduct}
                onAddIngredient={addIngredient}
                showAddButton
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recipes" className="mt-0">
          <RecipesGrid 
            recipes={recipes} 
            ingredients={ingredients}
            onAdd={addRecipe}
            onUpdate={updateRecipe}
            onDelete={deleteRecipe}
            products={products}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
        <DialogContent className="sm:max-w-2xl p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <AddProductWizard 
            ingredients={ingredients}
            recipes={recipes}
            onComplete={(productData) => {
              addProduct(productData);
              setIsAddProductOpen(false);
            }}
            onAddRecipe={addRecipe}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
