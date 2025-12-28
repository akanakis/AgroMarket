export enum UserRole {
  BUYER = 'BUYER',
  PRODUCER = 'PRODUCER',
}

export interface UserProfile {
  name: string;
  role: UserRole;
  location: string;
  // Producer specific
  farmName?: string;
  certifications?: string[]; // e.g., 'PDO', 'Organic', 'ISO'
  // Buyer specific
  preferences?: string[]; // e.g., 'Vegetables', 'Dairy'
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string; // e.g., 'kg', 'bunch', 'piece'
  category: string;
  location: string;
  sellerName: string;
  imageUrl: string;
  organic: boolean;
  harvestDate: string; // YYYY-MM-DD
  expirationDate?: string; // YYYY-MM-DD
  maxQuantity: number;
  rating: number;
  reviewCount: number;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  date: string;
  customerName: string;
  rating?: number; // 1-5
  status: 'Pending' | 'Completed';
}

export type AppView = 'LANDING' | 'REGISTER' | 'APP' | 'PRODUCT_DETAILS' | 'PRODUCER_PROFILE';
