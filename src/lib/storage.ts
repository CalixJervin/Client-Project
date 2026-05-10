import type { Ingredient, Recipe, Product, Sale, IngredientStatus } from '../types/inventory';

const KEYS = {
  INGREDIENTS: 'cafe_ingredients',
  RECIPES: 'cafe_recipes',
  PRODUCTS: 'cafe_products',
  SALES: 'cafe_sales_log',
};

export const calculateIngredientStatus = (currentStock: number, threshold: number): IngredientStatus => {
  if (currentStock === 0) return 'out';
  if (currentStock <= threshold * 0.25) return 'critical';
  if (currentStock <= threshold) return 'low';
  return 'good';
};

const getStorageItem = <T>(key: string, defaultValue: T): T => {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : defaultValue;
};

const setStorageItem = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const storage = {
  // Ingredients
  getIngredients: (): Ingredient[] => getStorageItem(KEYS.INGREDIENTS, []),
  saveIngredients: (ingredients: Ingredient[]): void => setStorageItem(KEYS.INGREDIENTS, ingredients),
  
  // Recipes
  getRecipes: (): Recipe[] => getStorageItem(KEYS.RECIPES, []),
  saveRecipes: (recipes: Recipe[]): void => setStorageItem(KEYS.RECIPES, recipes),
  
  // Products
  getProducts: (): Product[] => getStorageItem(KEYS.PRODUCTS, []),
  saveProducts: (products: Product[]): void => setStorageItem(KEYS.PRODUCTS, products),
  
  // Sales
  getSales: (): Sale[] => getStorageItem(KEYS.SALES, []),
  saveSales: (sales: Sale[]): void => setStorageItem(KEYS.SALES, sales),
};
