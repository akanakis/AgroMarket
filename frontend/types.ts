export enum UserRole {
  BUYER = 'BUYER',
  PRODUCER = 'PRODUCER',
}

export interface UserProfile {
  name: string;
  role: UserRole;
  location: string;
}

export interface ProductAPI {
  id: number;
  name: string;
  description: string;
  price: number;
  unit: string;
  category: string;
  location: string;
  seller_id: number;
  seller_name: string;
  image_url: string;
  organic: boolean;
  harvest_date: string;
  expiration_date: string | null;
  max_quantity: number;
  rating: number;
  review_count: number;
  created_at: string;
}

export interface OrderItemAPI {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
}

export interface OrderAPI {
  id: number;
  customer_id: number | null;
  customer_name: string;
  total: number;
  status: string;
  rating: number | null;
  created_at: string;
  items: OrderItemAPI[];
}
