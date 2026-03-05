import { Platform } from 'react-native';

// ==================== BASE URL ====================

const getBaseUrl = (): string => {
    const envUrl = process.env.EXPO_PUBLIC_API_URL;
    if (envUrl) return envUrl;

    if (__DEV__) {
        if (Platform.OS === 'android') return 'http://10.0.2.2:8000/api/v1';
        return 'http://localhost:8000/api/v1';
    }
    // Production: set EXPO_PUBLIC_API_URL in .env
    return 'http://localhost:8000/api/v1';
};

const API_BASE_URL = getBaseUrl();

export const getWsUrl = (): string => {
    const envUrl = process.env.EXPO_PUBLIC_API_URL;
    if (envUrl) return envUrl.replace('http', 'ws');

    if (__DEV__) {
        if (Platform.OS === 'android') return 'ws://10.0.2.2:8000/api/v1';
        return 'ws://localhost:8000/api/v1';
    }
    return 'ws://localhost:8000/api/v1';
};

// ==================== BASE CLIENT ====================

async function apiCall<T>(endpoint: string, options?: RequestInit, token?: string | null): Promise<T> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options?.headers as Record<string, string>),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
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
    refresh_token?: string;
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
    apiCall('/auth/register', { method: 'POST', body: JSON.stringify(payload) });

export const login = (email: string, password: string): Promise<TokenResponse> =>
    apiCall('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });

export const refreshTokenWithToken = (refreshToken: string): Promise<TokenResponse> =>
    apiCall('/auth/refresh/mobile', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${refreshToken}` },
    });

export const logout = (token: string): Promise<void> =>
    apiCall('/auth/logout', { method: 'POST' }, token);

export const getMe = (token: string): Promise<UserProfile> =>
    apiCall('/auth/me', {}, token);

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

export const fetchProducts = (filters?: { category?: string; organic_only?: boolean }): Promise<ProductAPI[]> => {
    const params = new URLSearchParams();
    if (filters?.category && filters.category !== 'All') params.append('category', filters.category);
    if (filters?.organic_only) params.append('organic_only', 'true');
    const qs = params.toString() ? `?${params}` : '';
    return apiCall(`/products${qs}`);
};

export const getProduct = (id: number): Promise<ProductAPI> =>
    apiCall(`/products/${id}`);

export const createProduct = (product: {
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
}, token: string): Promise<ProductAPI> =>
    apiCall('/products', { method: 'POST', body: JSON.stringify(product) }, token);

export const updateProduct = (id: number, product: object, token: string): Promise<ProductAPI> =>
    apiCall(`/products/${id}`, { method: 'PUT', body: JSON.stringify(product) }, token);

export const deleteProduct = (id: number, token: string): Promise<void> =>
    apiCall(`/products/${id}`, { method: 'DELETE' }, token);

// ==================== USERS ====================

export const fetchUser = (id: number): Promise<UserProfile> =>
    apiCall(`/users/${id}`);

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

export const createOrder = (order: {
    items: Array<{ product_id: number; quantity: number; price: number }>;
}, token: string): Promise<OrderAPI> =>
    apiCall('/orders', { method: 'POST', body: JSON.stringify(order) }, token);

export const fetchOrders = (token: string): Promise<OrderAPI[]> =>
    apiCall('/orders', {}, token);

export const fetchSellerOrders = (sellerId: number, token: string): Promise<OrderAPI[]> =>
    apiCall(`/orders/seller/${sellerId}`, {}, token);

export const updateOrderStatus = (orderId: number, status: string, token: string): Promise<OrderAPI> =>
    apiCall(`/orders/${orderId}/status`, { method: 'PUT', body: JSON.stringify({ status }) }, token);

export const rateOrder = (orderId: number, rating: number, token: string): Promise<void> =>
    apiCall(`/orders/${orderId}/rating`, { method: 'PUT', body: JSON.stringify({ rating }) }, token);

export const refundOrder = (orderId: number, token: string) =>
    apiCall<{ message: string; new_status: string }>(`/orders/${orderId}/refund`, { method: 'POST' }, token);

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

export const createReview = (review: {
    product_id: number;
    rating: number;
    comment: string;
}, token: string): Promise<ReviewAPI> =>
    apiCall('/reviews', { method: 'POST', body: JSON.stringify(review) }, token);

export const fetchProductReviews = (productId: number): Promise<ReviewAPI[]> =>
    apiCall(`/reviews/product/${productId}`);
