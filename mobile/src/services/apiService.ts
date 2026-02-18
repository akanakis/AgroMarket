import { Platform } from 'react-native';

// For Android emulator use 10.0.2.2, for iOS simulator use localhost
// For physical devices, use your machine's local IP address
const getBaseUrl = () => {
    if (__DEV__) {
        // Android emulator needs special IP to reach host machine
        if (Platform.OS === 'android') {
            return 'http://10.0.2.2:8000';
        }
        // iOS simulator can use localhost
        return 'http://localhost:8000';
    }
    // Production URL would go here
    return 'http://localhost:8000';
};

const API_BASE_URL = getBaseUrl();

// Helper function for API calls
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
        throw new Error(error.detail || `API Error: ${response.status}`);
    }

    return response.json();
}

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

export const fetchProducts = async (filters?: {
    category?: string;
    organic_only?: boolean;
}): Promise<ProductAPI[]> => {
    const params = new URLSearchParams();
    if (filters?.category && filters.category !== 'All') {
        params.append('category', filters.category);
    }
    if (filters?.organic_only) {
        params.append('organic_only', 'true');
    }

    const queryString = params.toString();
    return apiCall<ProductAPI[]>(`/api/products/${queryString ? `?${queryString}` : ''}`);
};

export const createProduct = async (product: {
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
    expiration_date?: string;
    max_quantity: number;
}): Promise<ProductAPI> => {
    return apiCall<ProductAPI>('/api/products/', {
        method: 'POST',
        body: JSON.stringify(product),
    });
};

export const updateProduct = async (
    id: number,
    product: Partial<{
        name: string;
        description: string;
        price: number;
        unit: string;
        category: string;
        location: string;
        image_url: string;
        organic: boolean;
        harvest_date: string;
        expiration_date: string;
        max_quantity: number;
    }>
): Promise<ProductAPI> => {
    return apiCall<ProductAPI>(`/api/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(product),
    });
};

export const deleteProduct = async (id: number): Promise<void> => {
    return apiCall<void>(`/api/products/${id}`, {
        method: 'DELETE',
    });
};

// ==================== USERS ====================
export interface UserAPI {
    id: number;
    name: string;
    role: string;
    location: string;
    farm_name: string | null;
    certifications: string | null;
    preferences: string | null;
    created_at: string;
}

export const createUser = async (user: {
    name: string;
    role: string;
    location: string;
    farm_name?: string;
    certifications?: string;
    preferences?: string;
}): Promise<UserAPI> => {
    return apiCall<UserAPI>('/api/users/', {
        method: 'POST',
        body: JSON.stringify(user),
    });
};

export const fetchUser = async (id: number): Promise<UserAPI> => {
    return apiCall<UserAPI>(`/api/users/${id}`);
};

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
    customer_id: number | null;
    customer_name: string;
    total: number;
    status: string;
    rating: number | null;
    created_at: string;
    items: OrderItemAPI[];
}

export const createOrder = async (order: {
    customer_name: string;
    total: number;
    status: string;
    customer_id?: number;
    items: Array<{
        product_id: number;
        quantity: number;
        price: number;
    }>;
}): Promise<OrderAPI> => {
    return apiCall<OrderAPI>('/api/orders/', {
        method: 'POST',
        body: JSON.stringify(order),
    });
};


export const fetchOrders = async (): Promise<OrderAPI[]> => {
    return apiCall<OrderAPI[]>('/api/orders/');
};

export const fetchSellerOrders = async (sellerId: number): Promise<OrderAPI[]> => {
    return apiCall<OrderAPI[]>(`/api/orders/seller/${sellerId}`);
};

export const updateOrderStatus = async (orderId: number, status: string): Promise<OrderAPI> => {
    return apiCall<OrderAPI>(`/api/orders/${orderId}/status?status=${status}`, {
        method: 'PUT',
    });
};

export const rateOrder = async (orderId: number, rating: number): Promise<void> => {
    return apiCall<void>(`/api/orders/${orderId}/rating?rating=${rating}`, {
        method: 'PUT',
    });
};

// ==================== REVIEWS ====================
export interface ReviewAPI {
    id: number;
    product_id: number;
    author: string;
    rating: number;
    comment: string;
    created_at: string;
}

export const createReview = async (review: {
    product_id: number;
    author: string;
    rating: number;
    comment: string;
}): Promise<ReviewAPI> => {
    return apiCall<ReviewAPI>('/api/reviews/', {
        method: 'POST',
        body: JSON.stringify(review),
    });
};

export const fetchProductReviews = async (productId: number): Promise<ReviewAPI[]> => {
    return apiCall<ReviewAPI[]>(`/api/reviews/product/${productId}`);
};

// ==================== UTILS ====================
export const refundOrder = async (orderId: number) => {
    return apiCall<{ message: string, new_status: string }>(`/api/orders/${orderId}/refund`, {
        method: 'POST',
    });
};

export const fetchTestUsers = async () => {
    return apiCall<{
        producer: { id: number; name: string; location: string } | null;
        buyer: { id: number; name: string; location: string } | null;
    }>('/api/debug/test-users');
};
