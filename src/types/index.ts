export type Retailer = 'Checkers' | 'Woolworths' | 'Pick n Pay' | 'Shoprite' | "Food Lover's";

export type CategoryName = 'Fruits' | 'Vegetables' | 'Meat' | 'Rice' | 'Dairy,Eggs & Milk' | 'Snacks';

export type TransportMethod = 'walk' | 'delivery' | 'taxi';

export interface Product {
  id: number;
  title: string;
  price: number;
  imageUrl: string;
  retailer: Retailer;
  category: CategoryName;
  dietaryTags?: string[]; // e.g. ['meat', 'pork', 'dairy', 'gluten', 'nuts', 'vegan', 'halal']
  availability?: string;
  unit?: string;
  distanceKm?: number;
}

export interface CartItem {
  id: string; // unique cart line id
  productId: number;
  title: string;
  price: number;
  retailer: Retailer;
  category: CategoryName;
  quantity: number;
  imageUrl: string;
}

export interface StoreMetadata {
  address: string;
  distanceKm: number;
  logo: string;
}

export interface UserPreferences {
  address: string;
  shoppingFrequency: 'Weekly' | 'Bi-weekly' | 'Monthly' | 'Ad-hoc';
  dietaryNeeds: string[]; // e.g. ['Vegetarian', 'Vegan', 'Halal', 'Gluten-free', 'Dairy-free']
  allergies: string[]; // e.g. ['Peanuts', 'Tree nuts', 'Shellfish', 'Dairy', 'Eggs', 'Wheat']
  productStyle: 'Budget-first' | 'Value & Balance' | 'Premium & Organic';
  cookingStyle: 'Quick & 30-min' | 'Meal-prep & Batch' | 'Home Gourmet' | 'Balanced Family';
  lifestyle: 'Student / Solo' | 'Young Couple' | 'Family with Kids' | 'Fitness & Active';
  notifications: boolean;
}

export interface BudgetHistoryItem {
  id: string;
  filename: string;
  dateExported: string;
  totalCost: number;
  budgetLimit: number;
  itemCount: number;
  stores: Retailer[];
  items: CartItem[];
  transportMethods: Record<string, TransportMethod>;
}

export interface AIRecommendation {
  id: number;
  productId: number;
  title: string;
  category: CategoryName;
  price: number;
  retailer: Retailer;
  imageUrl: string;
  reason: string;
  isFavourite?: boolean;
}
