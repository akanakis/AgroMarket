const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// ==================== BASE CLIENT ====================

async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // needed for httpOnly refresh cookie
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
    throw new Error(error.detail || `API Error: ${response.status}`);
  }

  if (response.status === 204) return undefined as T;

  return response.json();
}

// ==================== AUTH ====================

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: 'BUYER' | 'PRODUCER';
  location: string;
  farm_name?: string | null;
  certifications?: string | null;
  preferences?: string | null;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: 'BUYER' | 'PRODUCER';
  location: string;
  farm_name?: string;
}

export const register = (payload: RegisterPayload): Promise<UserProfile> =>
  apiClient('/auth/register', { method: 'POST', body: JSON.stringify(payload) });

export const login = (email: string, password: string): Promise<TokenResponse> =>
  apiClient('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });

export const refreshToken = (): Promise<TokenResponse> =>
  apiClient('/auth/refresh', { method: 'POST' });

export const logout = (token: string): Promise<void> =>
  apiClient('/auth/logout', { method: 'POST' }, token);

export const getMe = (token: string): Promise<UserProfile> =>
  apiClient('/auth/me', {}, token);

// ==================== PRODUCTS ====================

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
  updated_at: string | null;
}

export interface ProductCreatePayload {
  name: string;
  description: string;
  price: number;
  unit: string;
  category: string;
  location: string;
  image_url: string;
  organic: boolean;
  harvest_date: string;
  expiration_date?: string;
  max_quantity: number;
}

export const fetchProducts = (
  filters?: { category?: string; organic_only?: boolean },
): Promise<ProductAPI[]> => {
  const params = new URLSearchParams();
  if (filters?.category) params.append('category', filters.category);
  if (filters?.organic_only) params.append('organic_only', 'true');
  const qs = params.toString() ? `?${params}` : '';
  return apiClient(`/products${qs}`);
};

export const getProduct = (id: number): Promise<ProductAPI> =>
  apiClient(`/products/${id}`);

export const createProduct = (payload: ProductCreatePayload, token: string): Promise<ProductAPI> =>
  apiClient('/products', { method: 'POST', body: JSON.stringify(payload) }, token);

export const updateProduct = (
  id: number,
  payload: Partial<ProductCreatePayload>,
  token: string,
): Promise<ProductAPI> =>
  apiClient(`/products/${id}`, { method: 'PUT', body: JSON.stringify(payload) }, token);

export const deleteProduct = (id: number, token: string): Promise<void> =>
  apiClient(`/products/${id}`, { method: 'DELETE' }, token);

// ==================== ORDERS ====================

export interface OrderItemAPI {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
}

export interface OrderAPI {
  id: number;
  customer_id: number;
  customer_name: string;
  total: number;
  status: string;
  rating: number | null;
  created_at: string;
  items: OrderItemAPI[];
}

export const createOrder = (
  payload: { items: Array<{ product_id: number; quantity: number; price: number }> },
  token: string,
): Promise<OrderAPI> =>
  apiClient('/orders', { method: 'POST', body: JSON.stringify(payload) }, token);

export const fetchMyOrders = (token: string): Promise<OrderAPI[]> =>
  apiClient('/orders', {}, token);

export const getOrder = (id: number, token: string): Promise<OrderAPI> =>
  apiClient(`/orders/${id}`, {}, token);

export const fetchSellerOrders = (sellerId: number, token: string): Promise<OrderAPI[]> =>
  apiClient(`/orders/seller/${sellerId}`, {}, token);

export const updateOrderStatus = (
  orderId: number,
  status: string,
  token: string,
): Promise<OrderAPI> =>
  apiClient(`/orders/${orderId}/status`, { method: 'PUT', body: JSON.stringify({ status }) }, token);

export const rateOrder = (orderId: number, rating: number, token: string): Promise<OrderAPI> =>
  apiClient(`/orders/${orderId}/rating`, { method: 'PUT', body: JSON.stringify({ rating }) }, token);

export const getInvoice = (orderId: number, token: string): Promise<Blob> =>
  fetch(`${API_URL}/orders/${orderId}/invoice`, {
    headers: { Authorization: `Bearer ${token}` },
    credentials: 'include',
  }).then((res) => {
    if (!res.ok) throw new Error('Failed to fetch invoice');
    return res.blob();
  });

export const refundOrder = (
  orderId: number,
  token: string,
): Promise<{ message: string; new_status: string }> =>
  apiClient(`/orders/${orderId}/refund`, { method: 'POST' }, token);

// ==================== REVIEWS ====================

export interface ReviewAPI {
  id: number;
  product_id: number;
  author_id: number;
  author: string;
  rating: number;
  comment: string;
  created_at: string;
}

export const createReview = (
  payload: { product_id: number; rating: number; comment: string },
  token: string,
): Promise<ReviewAPI> =>
  apiClient('/reviews', { method: 'POST', body: JSON.stringify(payload) }, token);

export const fetchProductReviews = (productId: number): Promise<ReviewAPI[]> =>
  apiClient(`/reviews/product/${productId}`);

// ==================== USERS ====================

export const fetchUser = (id: number): Promise<UserProfile> =>
  apiClient(`/users/${id}`);

export const updateMyProfile = (
  payload: { name?: string; location?: string; farm_name?: string },
  token: string,
): Promise<UserProfile> =>
  apiClient('/users/me', { method: 'PUT', body: JSON.stringify(payload) }, token);
