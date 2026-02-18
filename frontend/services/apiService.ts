import { OrderAPI, ProductAPI } from '../types';

const API_URL = 'http://localhost:8000/api';

export const fetchOrders = async (): Promise<OrderAPI[]> => {
  const res = await fetch(`${API_URL}/orders/`);
  if (!res.ok) throw new Error('Failed to fetch orders');
  return res.json();
};

export const fetchProducts = async (): Promise<ProductAPI[]> => {
  const res = await fetch(`${API_URL}/products/`);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
};