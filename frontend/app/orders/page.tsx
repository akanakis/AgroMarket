'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Package, ChevronRight, ShoppingBag, Clock, CheckCircle, Truck } from 'lucide-react';
import * as API from '@/services/apiService';
import { useAuth } from '@/context/AuthContext';
import { OrderAPI } from '@/types';

export default function OrdersPage() {
    const router = useRouter();
    const { user, accessToken } = useAuth();
    const [orders, setOrders] = useState<OrderAPI[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && user.role !== 'BUYER') {
            router.push('/');
            return;
        }
        if (accessToken) loadOrders();
    }, [user, accessToken]);

    const loadOrders = async () => {
        try {
            const data = await API.fetchMyOrders(accessToken!);
            data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            setOrders(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#fafaf5] pt-24 pb-12 flex justify-center">
                <div className="animate-spin text-green-600">
                    <Package size={32} />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fafaf5] pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-extrabold text-stone-900 mb-8">My Orders</h1>

                {orders.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 shadow-sm">
                        <ShoppingBag className="w-16 h-16 text-stone-300 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-stone-700">No orders yet</h2>
                        <p className="text-stone-500 mt-2">Go to the marketplace and find some fresh products!</p>
                        <button
                            onClick={() => router.push('/')}
                            className="mt-6 bg-green-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-green-700 transition"
                        >
                            Browse Marketplace
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {orders.map((order) => (
                            <div
                                key={order.id}
                                onClick={() => router.push(`/orders/${order.id}`)}
                                className="bg-white rounded-xl border border-stone-200 p-6 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow group"
                            >
                                <div className="flex items-center gap-6">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getStatusColorBg(order.status)}`}>
                                        <StatusIcon status={order.status} size={20} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <p className="font-bold text-stone-900">Order #{order.id}</p>
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusColorBadge(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-stone-500 mt-1">
                                            {new Date(order.created_at).toLocaleDateString()} · {order.items.length} Items
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <p className="font-bold text-stone-900 text-lg">€{order.total.toFixed(2)}</p>
                                    <ChevronRight className="text-stone-300 group-hover:text-green-600 transition-colors" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function StatusIcon({ status, size }: { status: string, size: number }) {
    switch (status) {
        case 'Pending': return <Clock size={size} className="text-stone-500" />;
        case 'Processing': return <Package size={size} className="text-blue-500" />;
        case 'Shipped': return <Truck size={size} className="text-orange-500" />;
        case 'Completed': return <CheckCircle size={size} className="text-green-500" />;
        default: return <Package size={size} className="text-stone-500" />;
    }
}

function getStatusColorBg(status: string) {
    switch (status) {
        case 'Completed': return 'bg-green-50';
        case 'Processing': return 'bg-blue-50';
        case 'Shipped': return 'bg-orange-50';
        case 'Cancelled': return 'bg-red-50';
        default: return 'bg-stone-100';
    }
}

function getStatusColorBadge(status: string) {
    switch (status) {
        case 'Completed': return 'bg-green-100 text-green-700';
        case 'Processing': return 'bg-blue-100 text-blue-700';
        case 'Shipped': return 'bg-orange-100 text-orange-700';
        case 'Cancelled': return 'bg-red-100 text-red-700';
        default: return 'bg-stone-100 text-stone-600';
    }
}
