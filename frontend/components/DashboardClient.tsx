'use client';

import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react'; // Kept only what might be used, though ProducerDashboard now handles icons
import ProducerDashboard from './ProducerDashboard';
import BuyerOrderTracker from './BuyerOrderTracker';
import { Product, Order } from '../types';
import AddProductModal from './AddProductModal';
import { translations } from '../utils/translations';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Navbar from './Navbar';
import * as API from '../services/apiService';
import { useRouter } from 'next/navigation';

const DashboardClient: React.FC = () => {
    const { user, accessToken } = useAuth();
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
        if (!user) {
            router.push('/');
        }
    }, [user, router]);

    useEffect(() => {
        if (user?.id && user?.role === 'PRODUCER') {
            loadData();
        } else {
            setLoading(false);
        }
    }, [user?.id, user?.role]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [productsData, ordersData] = await Promise.all([
                API.fetchProducts(),
                user?.role === 'PRODUCER' && user?.id
                    ? API.fetchSellerOrders(user.id, accessToken!)
                    : API.fetchMyOrders(accessToken!)
            ]);

            // Filter products for this producer
            const myProducts = productsData
                .filter(p => p.seller_id === user?.id)
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

    const handleUpdateStatus = async (orderId: string, newStatus: string) => {
        try {
            await API.updateOrderStatus(parseInt(orderId), newStatus, accessToken!);
            loadData(); // Refresh to show new status
        } catch (error) {
            console.error('Failed to update status:', error);
            alert('Failed to update status');
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
            await API.deleteProduct(parseInt(id), accessToken!);
            loadData();
        }
    };

    if (loading) return <div className="min-h-screen bg-[#fcfdfa]"><Navbar /><div className="p-8 text-center text-stone-500">Loading...</div></div>;

    return (
        <div className="min-h-screen bg-[#fcfdfa]">
            {/* Navbar is inside layout usually, but here manually placed */}
            <Navbar />
            {user?.role === 'PRODUCER' ? (
                <ProducerDashboard
                    products={products}
                    orders={orders}
                    userProfile={user}
                    onAddProduct={() => setIsAddModalOpen(true)}
                    onDeleteProduct={handleDeleteProduct}
                    onUpdateStatus={handleUpdateStatus}
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
                sellerId={user?.id || 0}
                sellerName={user?.name || 'Unknown'}
            />
        </div>
    );
};

export default DashboardClient;
