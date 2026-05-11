import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import type { 
  Ingredient, Recipe, Product, Sale, 
  RestockEntry
} from '../types/inventory';
import { storage } from '../lib/storage';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface InventoryContextType {
  ingredients: Ingredient[];
  recipes: Recipe[];
  products: Product[];
  categories: string[];
  sales: Sale[];
  isLoading: boolean;
  addIngredient: (data: Omit<Ingredient, 'id' | 'restockLog' | 'status'>) => Promise<void>;
  updateIngredient: (id: string, data: Partial<Omit<Ingredient, 'id' | 'restockLog'>>) => Promise<void>;
  restockIngredient: (id: string, entry: Omit<RestockEntry, 'date'>) => Promise<void>;
  deleteIngredient: (id: string) => Promise<void>;
  addRecipe: (data: Omit<Recipe, 'id'>) => Promise<string | undefined>;
  updateRecipe: (id: string, data: Partial<Omit<Recipe, 'id'>>) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
  addProduct: (data: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, data: Partial<Omit<Product, 'id'>>) => Promise<void>;
  restockProduct: (id: string, entry: Omit<RestockEntry, 'date'>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  toggleProductStock: (id: string) => Promise<void>;
  processSale: (productId: string, variantIndex: number, quantity: number, orderItems?: any[]) => Promise<void>;
  addCategory: (name: string) => void;
  deleteCategory: (name: string) => void;
  refreshData: () => Promise<void>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

const DEFAULT_CATEGORIES = ["Hot Coffee", "Iced Coffee", "Milk Tea", "Fruit Tea", "Pastries"];

export const InventoryProvider = ({ children }: { children: ReactNode }) => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(() => {
    return storage.getItem('categories', DEFAULT_CATEGORIES);
  });
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    storage.setItem('categories', categories);
  }, [categories]);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [ings, recs, prods, sals] = await Promise.all([
        storage.getIngredients(),
        storage.getRecipes(),
        storage.getProducts(),
        storage.getSales()
      ]);

      // Calculate availability for products based on current stocks
      const updatedProducts = prods.map(product => {
        if (product.type === 'made-to-order') {
          // A made-to-order product is in stock if AT LEAST one variant has all its ingredients
          const anyVariantAvailable = product.variants.some(variant => {
            if (!variant.recipeId) return product.inStock; // Fallback to manual toggle if no recipe
            
            const recipe = recs.find(r => r.id === variant.recipeId);
            if (!recipe) return product.inStock;

            // Check if all ingredients in the recipe have > 0 stock
            return recipe.ingredients.every(ri => {
              const ingredient = ings.find(i => i.id === ri.ingredientId);
              return ingredient && ingredient.currentStock > 0;
            });
          });

          return {
            ...product,
            inStock: product.inStock && anyVariantAvailable
          };
        } else if (product.type === 'ready-made') {
          // A ready-made product is in stock if its quantity > 0
          return {
            ...product,
            inStock: product.inStock && (product.quantity || 0) > 0
          };
        }
        return product;
      });

      setIngredients(ings);
      setRecipes(recs);
      setProducts(updatedProducts);
      setSales(sals);
    } catch (error) {
      console.error("Error fetching inventory data:", error);
      toast.error("Failed to load inventory data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();

    // Subscribe to Realtime changes
    const channel = supabase
      .channel('inventory-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => fetchAll()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ingredients' },
        () => fetchAll()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'product_variants' },
        () => fetchAll()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAll]);

  const addIngredient = useCallback(async (data: any) => {
    const { error } = await supabase.from('ingredients').insert([{
      name: data.name,
      unit: data.unit,
      current_stock: data.currentStock,
      low_stock_threshold: data.lowStockThreshold,
      cost_per_unit: data.costPerUnit,
      supplier: data.supplier
    }]);
    if (error) {
      toast.error("Failed to add ingredient: " + error.message);
    } else {
      await fetchAll();
      toast.success("Ingredient added");
    }
  }, [fetchAll]);

  const updateIngredient = useCallback(async (id: string, data: any) => {
    const { error } = await supabase.from('ingredients').update({
      name: data.name,
      unit: data.unit,
      current_stock: data.currentStock,
      low_stock_threshold: data.lowStockThreshold,
      cost_per_unit: data.costPerUnit,
      supplier: data.supplier
    }).eq('id', id);

    if (error) {
      toast.error("Failed to update ingredient");
    } else {
      await fetchAll();
    }
  }, [fetchAll]);

  const restockIngredient = useCallback(async (id: string, entry: any) => {
    const ingredient = ingredients.find(i => i.id === id);
    if (!ingredient) return;

    const { error: logError } = await supabase.from('restock_logs').insert([{
      ingredient_id: id,
      quantity_added: entry.quantityAdded,
      supplier: entry.supplier,
      notes: entry.notes
    }]);

    const { error: updateError } = await supabase.from('ingredients').update({
      current_stock: ingredient.currentStock + entry.quantityAdded
    }).eq('id', id);

    if (logError || updateError) {
      toast.error("Failed to restock ingredient");
    } else {
      await fetchAll();
      toast.success("Ingredient restocked");
    }
  }, [ingredients, fetchAll]);

  const deleteIngredient = useCallback(async (id: string) => {
    const { error } = await supabase.from('ingredients').delete().eq('id', id);
    if (error) {
      toast.error("Failed to delete ingredient");
    } else {
      await fetchAll();
      toast.success("Ingredient deleted");
    }
  }, [fetchAll]);

  const addRecipe = useCallback(async (data: any) => {
    const { data: recipe, error: recipeError } = await supabase.from('recipes').insert([{
      name: data.name,
      yield: data.yield
    }]).select().single();

    if (recipeError || !recipe) {
      toast.error("Failed to create recipe");
      return;
    }

    const recipeIngredients = data.ingredients.map((ri: any) => ({
      recipe_id: recipe.id,
      ingredient_id: ri.ingredientId,
      quantity: ri.quantity
    }));

    const { error: riError } = await supabase.from('recipe_ingredients').insert(recipeIngredients);

    if (riError) {
      toast.error("Failed to add recipe ingredients");
    } else {
      await fetchAll();
      toast.success("Recipe created");
    }
    return recipe.id;
  }, [fetchAll]);

  const updateRecipe = useCallback(async (id: string, data: any) => {
    const { error: recipeError } = await supabase.from('recipes').update({
      name: data.name,
      yield: data.yield
    }).eq('id', id);

    if (recipeError) {
      toast.error("Failed to update recipe");
      return;
    }

    if (data.ingredients) {
      await supabase.from('recipe_ingredients').delete().eq('recipe_id', id);
      const recipeIngredients = data.ingredients.map((ri: any) => ({
        recipe_id: id,
        ingredient_id: ri.ingredientId,
        quantity: ri.quantity
      }));
      await supabase.from('recipe_ingredients').insert(recipeIngredients);
    }

    await fetchAll();
    toast.success("Recipe updated");
  }, [fetchAll]);

  const deleteRecipe = useCallback(async (id: string) => {
    const { error } = await supabase.from('recipes').delete().eq('id', id);
    if (error) {
      toast.error("Failed to delete recipe");
    } else {
      await fetchAll();
      toast.success("Recipe deleted");
    }
  }, [fetchAll]);

  const addProduct = useCallback(async (data: any) => {
    let imageUrl = data.image;
    if (data.image && data.image.startsWith('data:')) {
      imageUrl = await storage.uploadImage(data.image);
    }

    const { data: product, error: productError } = await supabase.from('products').insert([{
      name: data.name,
      category: data.category,
      type: data.type,
      image_url: imageUrl,
      in_stock: data.inStock,
      availability: data.availability,
      quantity: data.quantity,
      low_stock_threshold: data.lowStockThreshold
    }]).select().single();

    if (productError || !product) {
      toast.error("Failed to create product");
      return;
    }

    const variants = data.variants.map((v: any) => ({
      product_id: product.id,
      size: v.size,
      price: v.price,
      recipe_id: v.recipeId
    }));

    const { error: vError } = await supabase.from('product_variants').insert(variants);

    if (vError) {
      toast.error("Failed to add product variants");
    } else {
      await fetchAll();
      toast.success("Product created");
    }
  }, [fetchAll]);

  const updateProduct = useCallback(async (id: string, data: any) => {
    let imageUrl = data.image;
    if (data.image && data.image.startsWith('data:')) {
      imageUrl = await storage.uploadImage(data.image);
    }

    const { error: productError } = await supabase.from('products').update({
      name: data.name,
      category: data.category,
      type: data.type,
      image_url: imageUrl,
      in_stock: data.inStock,
      availability: data.availability,
      quantity: data.quantity,
      low_stock_threshold: data.lowStockThreshold
    }).eq('id', id);

    if (productError) {
      toast.error("Failed to update product");
      return;
    }

    if (data.variants) {
      await supabase.from('product_variants').delete().eq('product_id', id);
      const variants = data.variants.map((v: any) => ({
        product_id: id,
        size: v.size,
        price: v.price,
        recipe_id: v.recipeId
      }));
      await supabase.from('product_variants').insert(variants);
    }

    await fetchAll();
    toast.success("Product updated");
  }, [fetchAll]);

  const restockProduct = useCallback(async (id: string, entry: Omit<RestockEntry, 'date'>) => {
    const product = products.find(p => p.id === id);
    if (!product) return;

    const { error: logError } = await supabase.from('restock_logs').insert([{
      product_id: id,
      quantity_added: entry.quantityAdded,
      supplier: entry.supplier,
      notes: entry.notes
    }]);

    const newQty = (product.quantity || 0) + entry.quantityAdded;
    const { error: updateError } = await supabase.from('products').update({
      quantity: newQty,
      in_stock: newQty > 0 ? true : product.inStock
    }).eq('id', id);

    if (logError || updateError) {
      toast.error("Failed to restock product");
    } else {
      await fetchAll();
      toast.success("Stock updated successfully");
    }
  }, [products, fetchAll]);

  const deleteProduct = useCallback(async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      console.error("Delete product error:", error);
      toast.error(`Failed to delete product: ${error.message}`);
      throw error;
    } else {
      await fetchAll();
      toast.success("Product deleted");
    }
  }, [fetchAll]);

  const toggleProductStock = useCallback(async (id: string) => {
    const product = products.find(p => p.id === id);
    if (!product) return;

    const { error } = await supabase.from('products').update({
      in_stock: !product.inStock
    }).eq('id', id);

    if (error) {
      toast.error("Failed to toggle stock status");
    } else {
      await fetchAll();
    }
  }, [products, fetchAll]);

  const processSale = useCallback(async (productId: string, variantIndex: number, quantity: number) => {
    try {
      const product = products.find(p => p.id === productId);
      if (!product) return;

      const { data: variantData } = await supabase
        .from('product_variants')
        .select('id')
        .eq('product_id', productId)
        .eq('size', product.variants[variantIndex].size)
        .single();

      const rpcItems = [{
        product_id: productId,
        variant_id: variantData?.id,
        quantity: quantity
      }];

      const { data: lowStockIngs, error } = await supabase.rpc('deduct_stock_on_sale', {
        p_order_items: rpcItems
      });

      if (error) throw error;

      if (lowStockIngs && lowStockIngs.length > 0) {
        lowStockIngs.forEach((ing: any) => {
          toast.warning(`Low stock alert: ${ing.ingredient_name}`);
        });
      }

      await fetchAll();
    } catch (error) {
      console.error("Sale processing error:", error);
      toast.error("Failed to process sale stock deduction");
    }
  }, [products, fetchAll]);

  const addCategory = useCallback((name: string) => {
    setCategories(prev => {
      if (prev.includes(name)) return prev;
      return [...prev, name];
    });
  }, []);

  const deleteCategory = useCallback((name: string) => {
    setCategories(prev => prev.filter(c => c !== name));
  }, []);

  const contextValue = useMemo(() => ({
    ingredients, recipes, products, categories, sales, isLoading,
    addIngredient, updateIngredient, restockIngredient, deleteIngredient,
    addRecipe, updateRecipe, deleteRecipe,
    addProduct, updateProduct, restockProduct, deleteProduct, toggleProductStock,
    processSale, addCategory, deleteCategory, refreshData: fetchAll
  }), [
    ingredients, recipes, products, categories, sales, isLoading,
    addIngredient, updateIngredient, restockIngredient, deleteIngredient,
    addRecipe, updateRecipe, deleteRecipe,
    addProduct, updateProduct, restockProduct, deleteProduct, toggleProductStock,
    processSale, addCategory, deleteCategory, fetchAll
  ]);

  return (
    <InventoryContext.Provider value={contextValue}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
