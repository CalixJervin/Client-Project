import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import type { 
  Ingredient, Recipe, Product, Sale, 
  RestockEntry, ProductCategory
} from '../types/inventory';
import { storage, calculateIngredientStatus } from '../lib/storage';
import { toast } from 'sonner';
import { mockProducts } from '../POS/products';
import { generateId } from '../lib/utils';

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
  restockProduct: (id: string, entry: Omit<RestockEntry, 'date'>) => void;
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
    const storedIngredients = storage.getIngredients();
    const storedRecipes = storage.getRecipes();
    const storedProducts = storage.getProducts();
    const storedSales = storage.getSales();

    setIngredients(storedIngredients);
    setRecipes(storedRecipes);
    setSales(storedSales);

    if (storedProducts.length > 0) {
      // Ensure existing products have a type, default to ready-made as requested
      const migratedProducts = storedProducts.map(p => ({
        ...p,
        type: p.type || 'ready-made',
        quantity: p.quantity ?? (p.type === 'made-to-order' ? undefined : 0),
        lowStockThreshold: p.lowStockThreshold ?? (p.type === 'made-to-order' ? undefined : 5),
        restockLog: p.restockLog || (p.type === 'made-to-order' ? undefined : [])
      }));
      setProducts(migratedProducts);
    } else {
      // Map mock products to inventory product structure
      // Existing mock products are treated as made-to-order for existing behavior
      const initialInventoryProducts: Product[] = mockProducts.map(p => ({
        id: String(p.id),
        name: p.name,
        category: p.category as ProductCategory,
        type: 'made-to-order', 
        inStock: true,
        availability: 'all-day',
        image: p.image,
        variants: [{
          size: 'Regular',
          price: p.price,
          recipeId: null
        }]
      }));
      setProducts(initialInventoryProducts);
    }
  }, []);

  // Use effects with debounced storage saves
  useEffect(() => { if (ingredients.length > 0) storage.saveIngredients(ingredients); }, [ingredients]);
  useEffect(() => { if (recipes.length > 0) storage.saveRecipes(recipes); }, [recipes]);
  useEffect(() => { if (products.length > 0) storage.saveProducts(products); }, [products]);
  useEffect(() => { if (sales.length > 0) storage.saveSales(sales); }, [sales]);

  const addIngredient = useCallback((data: any) => {
    const newIngredient: Ingredient = {
      ...data,
      id: generateId(),
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
    const newRecipe: Recipe = { ...data, id: generateId() };
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
    const newProduct: Product = { ...data, id: generateId() };
    setProducts(prev => [...prev, newProduct]);
  }, []);

  const updateProduct = useCallback((id: string, data: any) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  }, []);

  const restockProduct = useCallback((id: string, entry: Omit<RestockEntry, 'date'>) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id && p.type === 'ready-made') {
        const newQty = (p.quantity || 0) + entry.quantityAdded;
        const newEntry: RestockEntry = { ...entry, date: new Date().toISOString() };
        return {
          ...p,
          quantity: newQty,
          restockLog: [newEntry, ...(p.restockLog || [])],
          inStock: newQty > 0 ? true : p.inStock // Automatically flip back to true if > 0
        };
      }
      return p;
    }));
    toast.success("Stock updated successfully");
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  }, []);

  const toggleProductStock = useCallback((id: string) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, inStock: !p.inStock } : p));
  }, []);

  const processSale = useCallback((productId: string, variantIndex: number, quantity: number) => {
    setProducts(prevProducts => {
      const product = prevProducts.find(p => p.id === productId);
      if (!product) return prevProducts;

      if (product.type === 'ready-made') {
        // Ready-made auto-deduction
        return prevProducts.map(p => {
          if (p.id === productId) {
            const newQty = Math.max(0, (p.quantity || 0) - quantity);
            const updated = {
              ...p,
              quantity: newQty,
              inStock: newQty === 0 ? false : p.inStock
            };
            
            if (newQty <= (p.lowStockThreshold || 0)) {
              toast.warning(`Low stock alert: ${p.name}`);
            }
            
            return updated;
          }
          return p;
        });
      } else {
        // Made-to-order logic (existing)
        const variant = product.variants[variantIndex];
        if (!variant || !variant.recipeId) return prevProducts;

        // Note: recipes and ingredients are updated below
        return prevProducts;
      }
    });

    // Handle ingredients update for made-to-order
    setIngredients(prevIngredients => {
      const product = products.find(p => p.id === productId);
      if (!product || product.type !== 'made-to-order') return prevIngredients;

      const variant = product.variants[variantIndex];
      if (!variant || !variant.recipeId) return prevIngredients;

      const recipe = recipes.find(r => r.id === variant.recipeId);
      if (!recipe) return prevIngredients;

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

    // Record the sale
    const product = products.find(p => p.id === productId);
    if (product) {
      const newSale: Sale = {
        id: generateId(),
        date: new Date().toISOString(),
        productId,
        variantIndex,
        quantity,
        totalPrice: (product.type === 'ready-made' ? (product.variants[0]?.price || 0) : (product.variants[variantIndex]?.price || 0)) * quantity,
      };
      setSales(prev => [newSale, ...prev]);
    }
  }, [products, recipes]);

  const contextValue = useMemo(() => ({
    ingredients, recipes, products, sales,
    addIngredient, updateIngredient, restockIngredient, deleteIngredient,
    addRecipe, updateRecipe, deleteRecipe,
    addProduct, updateProduct, restockProduct, deleteProduct, toggleProductStock,
    processSale
  }), [
    ingredients, recipes, products, sales,
    addIngredient, updateIngredient, restockIngredient, deleteIngredient,
    addRecipe, updateRecipe, deleteRecipe,
    addProduct, updateProduct, restockProduct, deleteProduct, toggleProductStock,
    processSale
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
