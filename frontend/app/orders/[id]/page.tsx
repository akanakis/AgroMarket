'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Package, ChevronLeft, Truck, CheckCircle, Clock, XCircle } from 'lucide-react';
import * as API from '../../../services/apiService';
import { useAuth } from '../../../context/AuthContext';
import { OrderAPI, ProductAPI } from '../../../types';

const STATUS_STEPS = [
    { key: 'Pending', label: 'Order Placed', icon: Clock },
    { key: 'Processing', label: 'Processing', icon: Package },
    { key: 'Shipped', label: 'Shipped', icon: Truck },
    { key: 'Completed', label: 'Delivered', icon: CheckCircle }
];

export default function OrderDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { accessToken } = useAuth();
    const orderId = Number(params.id);

    const [order, setOrder] = useState<OrderAPI | null>(null);
    const [products, setProducts] = useState<Record<number, string>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (accessToken) loadData();
    }, [orderId, accessToken]);

    const loadData = async () => {
        try {
            const [foundOrder, productsData] = await Promise.all([
                API.getOrder(orderId, accessToken!),
                API.fetchProducts()
            ]);

            setOrder(foundOrder);

            const pMap: Record<number, string> = {};
            productsData.forEach((p: ProductAPI) => pMap[p.id] = p.name);
            setProducts(pMap);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#fafaf5] pt-24 pb-12 flex justify-center">
            <div className="animate-spin text-green-600"><Package size={32} /></div>
        </div>
    );

    if (!order) return (
        <div className="min-h-screen bg-[#fafaf5] pt-24 pb-12 text-center text-stone-500">
            Order not found
        </div>
    );

    const currentStepIndex = STATUS_STEPS.findIndex(s => s.key === order.status);
    const isCancelled = order.status === 'Cancelled';

    return (
        <div className="min-h-screen bg-[#fafaf5] pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => router.back()}
                        className="p-2 bg-white rounded-full border border-stone-200 hover:bg-stone-50 transition"
                    >
                        <ChevronLeft size={20} className="text-stone-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-stone-900">Order #{order.id}</h1>
                        <p className="text-stone-500 text-sm">
                            Placed on {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                </div>

                <div className="flex justify-end mb-6">
                    <a
                        href={`http://localhost:8000/api/orders/${order.id}/invoice`}
                        target="_blank"
                        className="flex items-center gap-2 bg-stone-800 text-white px-4 py-2 rounded-xl font-bold hover:bg-stone-900 transition shadow-sm"
                    >
                        <Package size={18} />
                        Print Receipt
                    </a>
                </div>

                {/* Status Card */}
                <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-8 mb-6">
                    <h2 className="text-lg font-bold text-stone-900 mb-6">Order Status</h2>

                    {isCancelled ? (
                        <div className="bg-red-50 rounded-xl p-6 flex flex-col items-center gap-3">
                            <XCircle size={48} className="text-red-500" />
                            <p className="font-bold text-red-700 text-lg">Order Cancelled</p>
                            <p className="text-red-500 text-sm">This order has been cancelled.</p>
                        </div>
                    ) : (
                        <div className="relative">
                            {/* Desktop/Tablet Horizontal Timeline */}
                            <div className="hidden sm:block">
                                <div className="overflow-hidden mb-8">
                                    <div className="flex justify-between relative z-10">
                                        {STATUS_STEPS.map((step, index) => {
                                            const isActive = index <= currentStepIndex;
                                            const Icon = step.icon;
                                            return (
                                                <div key={step.key} className="flex flex-col items-center flex-1">
                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-colors ${isActive ? 'bg-green-600 border-green-100 text-white' : 'bg-stone-100 border-stone-50 text-stone-300'
                                                        }`}>
                                                        <Icon size={20} />
                                                    </div>
                                                    <p className={`mt-3 text-sm font-bold ${isActive ? 'text-stone-800' : 'text-stone-400'}`}>{step.label}</p>
                                                    {order.status === step.key && (
                                                        <span className="mt-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Current</span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {/* Connection Line */}
                                    <div className="absolute top-6 left-0 w-full h-1 bg-stone-100 -z-0">
                                        <div
                                            className="h-full bg-green-500 transition-all duration-500"
                                            style={{ width: `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Mobile Vertical Timeline */}
                            <div className="sm:hidden space-y-0 relative">
                                {STATUS_STEPS.map((step, index) => {
                                    const isActive = index <= currentStepIndex;
                                    const isLast = index === STATUS_STEPS.length - 1;
                                    const Icon = step.icon;

                                    return (
                                        <div key={step.key} className="flex gap-4 relative pb-8">
                                            {!isLast && (
                                                <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-stone-100">
                                                    {isActive && currentStepIndex > index && (
                                                        <div className="absolute inset-0 bg-green-500" />
                                                    )}
                                                </div>
                                            )}
                                            <div className={`relative z-10 w-10 h-10 shrink-0 rounded-full flex items-center justify-center border-2 ${isActive ? 'bg-green-600 border-green-600 text-white' : 'bg-stone-100 border-stone-200 text-stone-300'
                                                }`}>
                                                <Icon size={18} />
                                            </div>
                                            <div className="pt-2">
                                                <p className={`font-bold text-sm ${isActive ? 'text-stone-800' : 'text-stone-400'}`}>{step.label}</p>
                                                {order.status === step.key && (
                                                    <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full inline-block mt-1">Current Status</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                        </div>
                    )}
                </div>

                {/* Items & Total */}
                <div className="grid gap-6 sm:grid-cols-3">
                    <div className="sm:col-span-2 bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
                        <h2 className="text-lg font-bold text-stone-900 mb-4">Items ({order.items.length})</h2>
                        <div className="divide-y divide-stone-100">
                            {order.items.map((item, idx) => (
                                <div key={idx} className="py-4 flex justify-between items-center first:pt-0 last:pb-0">
                                    <div>
                                        <p className="font-bold text-stone-800">{products[item.product_id] || `Product #${item.product_id}`}</p>
                                        <p className="text-sm text-stone-500">{item.quantity} x €{item.price.toFixed(2)}</p>
                                    </div>
                                    <p className="font-bold text-stone-900">€{(item.quantity * item.price).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 h-fit">
                        <h2 className="text-lg font-bold text-stone-900 mb-4">Summary</h2>
                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-stone-600">
                                <span>Subtotal</span>
                                <span>€{order.total.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-stone-600">
                                <span>Shipping</span>
                                <span>Free</span>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-stone-100 flex justify-between items-center">
                            <span className="font-bold text-stone-900">Total</span>
                            <span className="font-extrabold text-2xl text-green-600">€{order.total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
