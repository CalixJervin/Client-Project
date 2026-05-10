export type IngredientUnit = 'grams' | 'ml' | 'pcs' | 'bottles' | 'packs';
export type IngredientStatus = 'good' | 'low' | 'critical' | 'out';

export interface RestockEntry {
  date: string;
  quantityAdded: number;
  supplier?: string;
  notes?: string;
}

export interface Ingredient {
  id: string;
  name: string;
  unit: IngredientUnit;
  currentStock: number;
  lowStockThreshold: number;
  costPerUnit?: number | null;
  supplier?: string | null;
  restockLog: RestockEntry[];
  status: IngredientStatus;
}

export interface RecipeIngredient {
  ingredientId: string;
  quantity: number;
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: RecipeIngredient[];
  yield: number;
}

export interface ProductVariant {
  size: string;
  price: number;
  recipeId: string | null;
}

export type ProductCategory = 'Drinks' | 'Food' | 'Pastries' | 'Add-ons';
export type ProductAvailability = 'all-day' | 'morning' | 'weekend';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  variants: ProductVariant[];
  image?: string | null; // base64
  inStock: boolean;
  availability: ProductAvailability;
}

export interface Sale {
  id: string;
  date: string;
  productId: string;
  variantIndex: number;
  quantity: number;
  totalPrice: number;
}
