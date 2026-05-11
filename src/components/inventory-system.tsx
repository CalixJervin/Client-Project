import { useMemo } from "react";
import { useInventory } from "@/hooks/useInventory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { 
  BarChart3,
} from "lucide-react";
import { InventoryTable, type InventoryItem } from "./inventory/InventoryTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface InventorySystemProps {
  externalSearchQuery?: string;
  onAddClick?: () => void;
}

export function InventorySystem({ externalSearchQuery = "", onAddClick }: InventorySystemProps) {
  const {
    ingredients,
    products,
    updateIngredient,
    deleteIngredient,
    restockIngredient,
    restockProduct,
    deleteProduct,
  } = useInventory();

  const activeTab = "made-to-order"; // Note: In this view, we handle filtering by tab via UI state if needed, but the current simplified version uses Tabs

  const inventoryItems = useMemo(() => {
    const ingItems: InventoryItem[] = ingredients.map(ing => ({
      id: ing.id,
      name: ing.name,
      type: 'made-to-order' as const,
      currentStock: ing.currentStock,
      unit: ing.unit,
      lowStockThreshold: ing.lowStockThreshold,
      status: ing.status,
      lastRestocked: ing.restockLog[0]?.date,
      originalType: 'ingredient' as const
    }));

    const readyMadeItems: InventoryItem[] = products
      .filter(p => p.type === 'ready-made')
      .map(p => {
        const qty = p.quantity || 0;
        const threshold = p.lowStockThreshold || 0;
        let status: 'good' | 'low' | 'critical' | 'out' = 'good';
        if (qty === 0) status = 'out';
        else if (qty <= threshold * 0.25) status = 'critical';
        else if (qty <= threshold) status = 'low';

        return {
          id: p.id,
          name: p.name,
          type: 'ready-made' as const,
          currentStock: qty,
          unit: 'pcs',
          lowStockThreshold: threshold,
          status: status,
          lastRestocked: p.restockLog?.[0]?.date,
          originalType: 'product' as const
        };
      });

    return [...ingItems, ...readyMadeItems];
  }, [ingredients, products]);

  const filteredItems = (type: 'made-to-order' | 'ready-made') => 
    inventoryItems.filter(item => 
      item.type === type && 
      item.name.toLowerCase().includes(externalSearchQuery.toLowerCase())
    );

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-foreground">Stock Levels</h2>
        </div>
        
        <Button 
          onClick={onAddClick}
          className="bg-[#22c55e] hover:bg-[#16a34a] text-white gap-2 h-9 px-4 rounded-full shadow-sm font-bold text-sm transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Add Ingredient
        </Button>
      </div>

      <Tabs defaultValue="made-to-order" className="w-full">
        <TabsList className="w-full md:w-auto grid grid-cols-2 md:inline-flex h-12 bg-muted/80 p-1 rounded-xl mb-6 shadow-inner border border-border/50">
          <TabsTrigger value="made-to-order" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm px-8 font-medium">Made to Order</TabsTrigger>
          <TabsTrigger value="ready-made" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm px-8 font-medium">Ready Made</TabsTrigger>
        </TabsList>

        <TabsContent value="made-to-order" className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <InventoryTable 
            items={filteredItems('made-to-order')} 
            onUpdateIngredient={updateIngredient}
            onDeleteIngredient={deleteIngredient}
            onDeleteProduct={deleteProduct}
          />
        </TabsContent>

        <TabsContent value="ready-made" className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <InventoryTable 
            items={filteredItems('ready-made')} 
            onUpdateIngredient={updateIngredient}
            onDeleteIngredient={deleteIngredient}
            onDeleteProduct={deleteProduct}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
