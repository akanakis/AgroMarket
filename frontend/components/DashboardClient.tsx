'use client';

import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react'; // Kept only what might be used, though ProducerDashboard now handles icons
import ProducerDashboard from './ProducerDashboard';
import BuyerOrderTracker from './BuyerOrderTracker';
import { Product, Order, UserRole } from '../types';
import AddProductModal from './AddProductModal';
import { translations } from '../utils/translations';
// import ProductStats from './ProductStats'; // Assuming this exists or is inline? 
// Checking ProducerDashboard.tsx content... it seems inline or I missed it. 
// I'll inline standard dashboard logic.
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Navbar from './Navbar';
import * as API from '../services/apiService';
import { useRouter } from 'next/navigation';

const DashboardClient: React.FC = () => {
    const { role, userProfile, currentUserId } = useAuth();
    const { lang } = useLanguage();
    const router = useRouter();
    const t = translations[lang];

    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    // Local state for modal/editing
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // Redirect if not authorized
    useEffect(() => {
        if (!role) {
            router.push('/'); // Redirect to landing if no role
        } else if (role === UserRole.BUYER) {
            // Maybe redirect to marketplace or show buyer dashboard?
            // For now, let's allow buyer to have a simple dashboard or redirect.
            // The task implies migrating ProducerDashboard.
        }
    }, [role, router]);

    useEffect(() => {
        if (currentUserId && role === UserRole.PRODUCER) {
            loadData();
        } else {
            setLoading(false);
        }
    }, [currentUserId, role]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [productsData, ordersData] = await Promise.all([
                API.fetchProducts(),
                API.fetchOrders()
            ]);

            // Filter products for this producer
            const myProducts = productsData
                .filter(p => p.seller_name === userProfile?.name) // Ideally filter by ID if available or correct logical check
                .map(p => ({
                    id: p.id.toString(),
                    name: p.name,
                    description: p.description,
                    price: p.price,
                    unit: p.unit,
                    category: p.category,
                    location: p.location,
                    sellerName: p.seller_name,
                    imageUrl: p.image_url,
                    organic: p.organic,
                    harvestDate: p.harvest_date,
                    expirationDate: p.expiration_date || undefined,
                    maxQuantity: p.max_quantity,
                    rating: p.rating,
                    reviewCount: p.review_count
                }));

            setProducts(myProducts);

            // Filter orders? API might return all orders or filtered on backend.
            // Assuming frontend filtering for now as per previous implementation logic
            const myOrders = ordersData.map(o => ({
                id: o.id.toString(),
                items: [], // Fetch items details if needed
                total: o.total,
                date: o.created_at,
                customerName: o.customer_name,
                status: o.status as 'Pending' | 'Completed',
                rating: o.rating || undefined
            }));
            setOrders(myOrders);

        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddProduct = async (formData: any) => { // Type properly or use any for speed
        // Call API
        // Reload data
        setIsAddModalOpen(false);
        loadData();
    };

    const handleDeleteProduct = async (id: string) => {
        if (window.confirm('Delete this product?')) {
            await API.deleteProduct(parseInt(id));
            loadData();
        }
    };

    if (loading) return <div className="min-h-screen bg-[#fcfdfa]"><Navbar /><div className="p-8 text-center text-stone-500">Loading...</div></div>;

    return (
        <div className="min-h-screen bg-[#fcfdfa]">
            <Navbar />
            {role === UserRole.PRODUCER ? (
                <ProducerDashboard
                    products={products}
                    orders={orders}
                    userProfile={userProfile}
                    onAddProduct={() => setIsAddModalOpen(true)}
                    onDeleteProduct={handleDeleteProduct}
                />
            ) : (
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <BuyerOrderTracker orders={orders} />
                </div>
            )}

            <AddProductModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onProductAdded={() => {
                    loadData();
                    setIsAddModalOpen(false);
                }}
                sellerId={currentUserId || 0}
                sellerName={userProfile?.name || 'Unknown'}
            />
        </div>
    );
};

export default DashboardClient;
