'use client';

import React, { useState, useEffect } from 'react';
import { Package, Search, Filter } from 'lucide-react';
import Navbar from '../../components/Navbar';
import * as API from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';
import { Order } from '../../types';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminPage() {
    const { accessToken } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (accessToken) loadData();
    }, [accessToken]);

    const loadData = async () => {
        try {
            const data = await API.fetchMyOrders(accessToken!);
            // Map backend data to frontend types if needed, similar to DashboardClient
            // Assuming simplified mapping for admin view
            const mappedOrders = data.map((o: any) => ({
                id: o.id.toString(),
                items: [],
                total: o.total,
                date: o.created_at,
                customerName: o.customer_name || 'Guest',
                status: o.status,
                rating: o.rating
            }));
            setOrders(mappedOrders);
        } catch (error) {
            console.error('Failed to load admin data', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesFilter = filter === 'All' || order.status === filter;
        const matchesSearch =
            order.id.includes(search) ||
            order.customerName.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-[#fcfdfa]">
            {/* Reusing Navbar for consistency, though Admin might need different nav */}
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-stone-800">Admin Support</h1>
                        <p className="text-stone-500">Manage orders and assist users</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-xl border border-stone-100 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by Order ID or Customer Name..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
                        <Filter size={20} className="text-stone-400" />
                        {['All', 'Pending', 'Processing', 'Shipped', 'Completed', 'Cancelled'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                                    filter === status
                                        ? "bg-stone-800 text-white"
                                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                                )}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Orders Table */}
                <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="p-8 space-y-4">
                            {[1, 2, 3, 4, 5].map(i => (
                                <Skeleton key={i} className="h-16 w-full" />
                            ))}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-stone-50 text-stone-500 text-sm font-semibold uppercase">
                                    <tr>
                                        <th className="px-6 py-4">Order ID</th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Customer</th>
                                        <th className="px-6 py-4">Total</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100">
                                    {filteredOrders.map(order => (
                                        <tr key={order.id} className="hover:bg-stone-50/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-stone-800">#{order.id}</td>
                                            <td className="px-6 py-4 text-stone-600">
                                                {order.date ? format(new Date(order.date), 'MMM d, yyyy') : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-stone-800">{order.customerName}</td>
                                            <td className="px-6 py-4 font-bold text-stone-800">${order.total.toFixed(2)}</td>
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "px-2 py-1 rounded-full text-xs font-bold uppercase",
                                                    order.status === 'Completed' ? "bg-green-100 text-green-700" :
                                                        order.status === 'Pending' ? "bg-yellow-100 text-yellow-700" :
                                                            order.status === 'Cancelled' ? "bg-red-100 text-red-700" :
                                                                "bg-blue-100 text-blue-700"
                                                )}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredOrders.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-stone-500">
                                                <Package className="w-12 h-12 mx-auto mb-3 text-stone-300" />
                                                No orders found matching your criteria.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
