import type { Ingredient, Recipe, Product, Sale, IngredientStatus } from '../types/inventory';

const KEYS = {
  INGREDIENTS: 'cafe_ingredients',
  RECIPES: 'cafe_recipes',
  PRODUCTS: 'cafe_products',
  SALES: 'cafe_sales_log',
  TRANSACTIONS: 'timpla_transactions',
  TRANSACTION_ITEMS: 'timpla_transaction_items',
  STAFF: 'timpla_staff',
  CURRENT_USER_ID: 'timpla_current_user_id',
  SESSION_EXPIRY: 'timpla_session_expiry',
  IS_LOCKED: 'timpla_is_locked',
};

export const calculateIngredientStatus = (currentStock: number, threshold: number): IngredientStatus => {
  if (currentStock === 0) return 'out';
  if (currentStock <= threshold * 0.25) return 'critical';
  if (currentStock <= threshold) return 'low';
  return 'good';
};

// Cache for reads
const storageCache: Record<string, any> = {};

const getStorageItem = <T>(key: string, defaultValue: T): T => {
  if (storageCache[key] !== undefined) {
    return storageCache[key];
  }
  try {
    const item = localStorage.getItem(key);
    const parsed = item ? JSON.parse(item) : defaultValue;
    storageCache[key] = parsed;
    return parsed;
  } catch (e) {
    console.error(`Error reading storage key "${key}":`, e);
    return defaultValue;
  }
};

// Debounce map for writes
const debounceTimers: Record<string, ReturnType<typeof setTimeout>> = {};

const setStorageItem = <T>(key: string, value: T, debounceMs = 1000): void => {
  storageCache[key] = value;
  
  if (debounceTimers[key]) {
    clearTimeout(debounceTimers[key]);
  }

  debounceTimers[key] = setTimeout(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      delete debounceTimers[key];
    } catch (e) {
      console.error(`Error writing storage key "${key}":`, e);
    }
  }, debounceMs);
};

const removeStorageItem = (key: string): void => {
  delete storageCache[key];
  if (debounceTimers[key]) {
    clearTimeout(debounceTimers[key]);
    delete debounceTimers[key];
  }
  localStorage.removeItem(key);
};

export const storage = {
  // Generic methods
  getItem: getStorageItem,
  setItem: setStorageItem,
  removeItem: removeStorageItem,

  // Specific helpers to maintain backward compatibility and clean API
  getIngredients: (): Ingredient[] => getStorageItem(KEYS.INGREDIENTS, []),
  saveIngredients: (ingredients: Ingredient[]): void => setStorageItem(KEYS.INGREDIENTS, ingredients),
  
  getRecipes: (): Recipe[] => getStorageItem(KEYS.RECIPES, []),
  saveRecipes: (recipes: Recipe[]): void => setStorageItem(KEYS.RECIPES, recipes),
  
  getProducts: (): Product[] => getStorageItem(KEYS.PRODUCTS, []),
  saveProducts: (products: Product[]): void => setStorageItem(KEYS.PRODUCTS, products),
  
  getSales: (): Sale[] => getStorageItem(KEYS.SALES, []),
  saveSales: (sales: Sale[]): void => setStorageItem(KEYS.SALES, sales),

  getTransactions: () => getStorageItem(KEYS.TRANSACTIONS, []),
  saveTransactions: (transactions: any[]) => setStorageItem(KEYS.TRANSACTIONS, transactions),

  getTransactionItems: () => getStorageItem(KEYS.TRANSACTION_ITEMS, []),
  saveTransactionItems: (items: any[]) => setStorageItem(KEYS.TRANSACTION_ITEMS, items),

  getStaff: () => getStorageItem(KEYS.STAFF, []),
  saveStaff: (staff: any[]) => setStorageItem(KEYS.STAFF, staff),
  
  clearAll: () => {
    Object.keys(debounceTimers).forEach(key => clearTimeout(debounceTimers[key]));
    Object.keys(storageCache).forEach(key => delete storageCache[key]);
    localStorage.clear();
  }
};
