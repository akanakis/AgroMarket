export enum UserRole {
    BUYER = 'BUYER',
    PRODUCER = 'PRODUCER',
}

export interface UserProfile {
    name: string;
    role: UserRole;
    location: string;
    farmName?: string;
    certifications?: string[];
    preferences?: string[];
}

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    unit: string;
    category: string;
    location: string;
    sellerName: string;
    imageUrl: string;
    organic: boolean;
    harvestDate: string;
    expirationDate?: string;
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
    rating?: number;
    status: 'Pending' | 'Processing' | 'Shipped' | 'Completed' | 'Cancelled';
}
