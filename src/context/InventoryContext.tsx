import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { 
  Ingredient, Recipe, Product, Sale, 
  RestockEntry, IngredientStatus
} from '../types/inventory';
import { storage, calculateIngredientStatus } from '../lib/storage';
import { toast } from 'sonner';

interface InventoryContextType {
  ingredients: Ingredient[];
  recipes: Recipe[];
  products: Product[];
  sales: Sale[];
  addIngredient: (data: Omit<Ingredient, 'id' | 'restockLog' | 'status'>) => void;
  updateIngredient: (id: string, data: Partial<Omit<Ingredient, 'id' | 'restockLog'>>) => void;
  restockIngredient: (id: string, entry: Omit<RestockEntry, 'date'>) => void;
  deleteIngredient: (id: string) => void;
  addRecipe: (data: Omit<Recipe, 'id'>) => string;
  updateRecipe: (id: string, data: Partial<Omit<Recipe, 'id'>>) => void;
  deleteRecipe: (id: string) => void;
  addProduct: (data: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, data: Partial<Omit<Product, 'id'>>) => void;
  deleteProduct: (id: string) => void;
  toggleProductStock: (id: string) => void;
  processSale: (productId: string, variantIndex: number, quantity: number) => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider = ({ children }: { children: ReactNode }) => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);

  useEffect(() => {
    setIngredients(storage.getIngredients());
    setRecipes(storage.getRecipes());
    setProducts(storage.getProducts());
    setSales(storage.getSales());
  }, []);

  useEffect(() => { storage.saveIngredients(ingredients); }, [ingredients]);
  useEffect(() => { storage.saveRecipes(recipes); }, [recipes]);
  useEffect(() => { storage.saveProducts(products); }, [products]);
  useEffect(() => { storage.saveSales(sales); }, [sales]);

  const addIngredient = useCallback((data: any) => {
    const newIngredient: Ingredient = {
      ...data,
      id: crypto.randomUUID(),
      restockLog: [],
      status: calculateIngredientStatus(data.currentStock, data.lowStockThreshold),
    };
    setIngredients(prev => [...prev, newIngredient]);
  }, []);

  const updateIngredient = useCallback((id: string, data: any) => {
    setIngredients(prev => prev.map(ing => {
      if (ing.id === id) {
        const updated = { ...ing, ...data };
        updated.status = calculateIngredientStatus(updated.currentStock, updated.lowStockThreshold);
        return updated;
      }
      return ing;
    }));
  }, []);

  const restockIngredient = useCallback((id: string, entry: any) => {
    setIngredients(prev => prev.map(ing => {
      if (ing.id === id) {
        const newCurrentStock = ing.currentStock + entry.quantityAdded;
        const newEntry: RestockEntry = { ...entry, date: new Date().toISOString() };
        return {
          ...ing,
          currentStock: newCurrentStock,
          restockLog: [newEntry, ...ing.restockLog],
          status: calculateIngredientStatus(newCurrentStock, ing.lowStockThreshold),
        };
      }
      return ing;
    }));
  }, []);

  const deleteIngredient = useCallback((id: string) => {
    setIngredients(prev => prev.filter(ing => ing.id !== id));
  }, []);

  const addRecipe = useCallback((data: any) => {
    const newRecipe: Recipe = { ...data, id: crypto.randomUUID() };
    setRecipes(prev => [...prev, newRecipe]);
    return newRecipe.id;
  }, []);

  const updateRecipe = useCallback((id: string, data: any) => {
    setRecipes(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));
  }, []);

  const deleteRecipe = useCallback((id: string) => {
    setRecipes(prev => prev.filter(r => r.id !== id));
  }, []);

  const addProduct = useCallback((data: any) => {
    const newProduct: Product = { ...data, id: crypto.randomUUID() };
    setProducts(prev => [...prev, newProduct]);
  }, []);

  const updateProduct = useCallback((id: string, data: any) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  }, []);

  const toggleProductStock = useCallback((id: string) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, inStock: !p.inStock } : p));
  }, []);

  const processSale = useCallback((productId: string, variantIndex: number, quantity: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const variant = product.variants[variantIndex];
    if (!variant || !variant.recipeId) return;

    const recipe = recipes.find(r => r.id === variant.recipeId);
    if (!recipe) return;

    setIngredients(prevIngredients => {
      let alerts: string[] = [];
      const updatedIngredients = prevIngredients.map(ing => {
        const recipeIngredient = recipe.ingredients.find(ri => ri.ingredientId === ing.id);
        if (recipeIngredient) {
          const deduction = (recipeIngredient.quantity / recipe.yield) * quantity;
          const newStock = Math.max(0, ing.currentStock - deduction);
          const newStatus = calculateIngredientStatus(newStock, ing.lowStockThreshold);
          
          if (newStatus !== 'good' && ing.status === 'good') {
            alerts.push(ing.name);
          }
          
          return { ...ing, currentStock: newStock, status: newStatus };
        }
        return ing;
      });

      if (alerts.length > 0) {
        toast.warning(`Low stock alert: ${alerts.join(', ')}`);
      }

      return updatedIngredients;
    });

    const newSale: Sale = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      productId,
      variantIndex,
      quantity,
      totalPrice: variant.price * quantity,
    };
    setSales(prev => [newSale, ...prev]);
  }, [products, recipes]);

  return (
    <InventoryContext.Provider value={{
      ingredients, recipes, products, sales,
      addIngredient, updateIngredient, restockIngredient, deleteIngredient,
      addRecipe, updateRecipe, deleteRecipe,
      addProduct, updateProduct, deleteProduct, toggleProductStock,
      processSale
    }}>
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
