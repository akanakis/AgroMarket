'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Package, Users, TrendingUp, ShoppingCart,
    Leaf, Star, Search, Filter, RefreshCw
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import * as API from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';

const STATUS_COLORS: Record<string, string> = {
    Completed: 'bg-green-100 text-green-700',
    Pending: 'bg-yellow-100 text-yellow-700',
    Processing: 'bg-blue-100 text-blue-700',
    Shipped: 'bg-purple-100 text-purple-700',
    Cancelled: 'bg-red-100 text-red-700',
};

export default function AdminPage() {
    const { user, accessToken } = useAuth();
    const router = useRouter();

    const [stats, setStats] = useState<API.AdminStats | null>(null);
    const [orders, setOrders] = useState<API.OrderAPI[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<'orders' | 'users'>('orders');
    const [allUsers, setAllUsers] = useState<API.UserProfile[]>([]);

    useEffect(() => {
        if (!user) return;
        if (user.role !== 'ADMIN') {
            router.replace('/');
            return;
        }
        loadData();
    }, [user, accessToken]);

    const loadData = async () => {
        if (!accessToken) return;
        setLoading(true);
        try {
            const [statsData, ordersData, usersData] = await Promise.all([
                API.fetchAdminStats(accessToken),
                API.fetchAllOrders(accessToken, { limit: 100 }),
                API.fetchAllUsers(accessToken),
            ]);
            setStats(statsData);
            setOrders(ordersData);
            setAllUsers(usersData);
        } catch (err) {
            console.error('Admin load failed', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesFilter = filter === 'All' || order.status === filter;
        const matchesSearch =
            String(order.id).includes(search) ||
            order.customer_name.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    if (!user || user.role !== 'ADMIN') return null;

    return (
        <div className="min-h-screen bg-[#fcfdfa]">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-8">

                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-stone-800">Admin Dashboard</h1>
                        <p className="text-stone-500 mt-1">Platform overview and management</p>
                    </div>
                    <button
                        onClick={loadData}
                        className="flex items-center gap-2 px-4 py-2 bg-stone-800 text-white rounded-lg hover:bg-stone-700 transition-colors text-sm font-medium"
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </button>
                </div>

                {/* Stats Cards */}
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-28 bg-stone-100 animate-pulse rounded-2xl" />
                        ))}
                    </div>
                ) : stats && (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <StatCard
                                icon={<TrendingUp size={22} className="text-green-600" />}
                                label="Total Revenue"
                                value={`€${stats.total_revenue.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                bg="bg-green-50"
                            />
                            <StatCard
                                icon={<ShoppingCart size={22} className="text-blue-600" />}
                                label="Total Orders"
                                value={stats.total_orders.toString()}
                                sub={`${stats.orders_by_status.Completed ?? 0} completed`}
                                bg="bg-blue-50"
                            />
                            <StatCard
                                icon={<Users size={22} className="text-purple-600" />}
                                label="Total Users"
                                value={stats.total_users.toString()}
                                sub={`${stats.producers_count} producers · ${stats.buyers_count} buyers`}
                                bg="bg-purple-50"
                            />
                            <StatCard
                                icon={<Package size={22} className="text-orange-600" />}
                                label="Products"
                                value={stats.total_products.toString()}
                                sub={`${stats.organic_products} organic`}
                                bg="bg-orange-50"
                            />
                        </div>

                        {/* Orders by Status bar */}
                        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 mb-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Star size={16} className="text-stone-400" />
                                <h2 className="font-semibold text-stone-700">Orders by Status</h2>
                            </div>
                            <div className="flex gap-3 flex-wrap">
                                {Object.entries(stats.orders_by_status).map(([status, count]) => (
                                    <div key={status} className="flex items-center gap-2">
                                        <span className={cn('px-3 py-1 rounded-full text-xs font-bold uppercase', STATUS_COLORS[status] ?? 'bg-stone-100 text-stone-600')}>
                                            {status}
                                        </span>
                                        <span className="text-sm font-semibold text-stone-700">{count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Reviews & organic badges */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-white border border-stone-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
                                <Star size={28} className="text-yellow-400" />
                                <div>
                                    <p className="text-2xl font-bold text-stone-800">{stats.total_reviews}</p>
                                    <p className="text-sm text-stone-500">Total Reviews</p>
                                </div>
                            </div>
                            <div className="bg-white border border-stone-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
                                <Leaf size={28} className="text-green-500" />
                                <div>
                                    <p className="text-2xl font-bold text-stone-800">
                                        {stats.total_products > 0
                                            ? Math.round((stats.organic_products / stats.total_products) * 100)
                                            : 0}%
                                    </p>
                                    <p className="text-sm text-stone-500">Organic Listings</p>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Tabs */}
                <div className="flex gap-2 mb-4">
                    {(['orders', 'users'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                'px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-colors',
                                activeTab === tab
                                    ? 'bg-stone-800 text-white'
                                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {activeTab === 'orders' && (
                    <>
                        {/* Filters */}
                        <div className="bg-white p-4 rounded-xl border border-stone-100 shadow-sm mb-4 flex flex-col md:flex-row gap-4 items-center">
                            <div className="relative flex-1 w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search by Order ID or Customer..."
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
                                <Filter size={18} className="text-stone-400 shrink-0" />
                                {['All', 'Pending', 'Processing', 'Shipped', 'Completed', 'Cancelled'].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setFilter(s)}
                                        className={cn(
                                            'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors',
                                            filter === s ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                        )}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
                            {loading ? (
                                <div className="p-8 space-y-3">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className="h-12 bg-stone-100 animate-pulse rounded" />
                                    ))}
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-stone-50 text-stone-500 text-xs font-semibold uppercase">
                                            <tr>
                                                <th className="px-5 py-3">Order</th>
                                                <th className="px-5 py-3">Date</th>
                                                <th className="px-5 py-3">Customer</th>
                                                <th className="px-5 py-3">Total</th>
                                                <th className="px-5 py-3">Status</th>
                                                <th className="px-5 py-3">Items</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-stone-100">
                                            {filteredOrders.map(order => (
                                                <tr key={order.id} className="hover:bg-stone-50/50 transition-colors">
                                                    <td className="px-5 py-3 font-mono text-sm font-medium text-stone-700">#{order.id}</td>
                                                    <td className="px-5 py-3 text-sm text-stone-500">
                                                        {order.created_at ? format(new Date(order.created_at), 'MMM d, yyyy') : '—'}
                                                    </td>
                                                    <td className="px-5 py-3 text-sm text-stone-800">{order.customer_name}</td>
                                                    <td className="px-5 py-3 text-sm font-bold text-stone-800">€{order.total.toFixed(2)}</td>
                                                    <td className="px-5 py-3">
                                                        <span className={cn(
                                                            'px-2 py-0.5 rounded-full text-xs font-bold uppercase',
                                                            STATUS_COLORS[order.status] ?? 'bg-stone-100 text-stone-600'
                                                        )}>
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3 text-sm text-stone-500">{order.items.length}</td>
                                                </tr>
                                            ))}
                                            {filteredOrders.length === 0 && (
                                                <tr>
                                                    <td colSpan={6} className="px-5 py-12 text-center text-stone-400 text-sm">
                                                        No orders found.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {activeTab === 'users' && (
                    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
                        {loading ? (
                            <div className="p-8 space-y-3">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="h-12 bg-stone-100 animate-pulse rounded" />
                                ))}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-stone-50 text-stone-500 text-xs font-semibold uppercase">
                                        <tr>
                                            <th className="px-5 py-3">ID</th>
                                            <th className="px-5 py-3">Name</th>
                                            <th className="px-5 py-3">Email</th>
                                            <th className="px-5 py-3">Role</th>
                                            <th className="px-5 py-3">Location</th>
                                            <th className="px-5 py-3">Joined</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-100">
                                        {allUsers.map(u => (
                                            <tr key={u.id} className="hover:bg-stone-50/50">
                                                <td className="px-5 py-3 text-sm font-mono text-stone-500">{u.id}</td>
                                                <td className="px-5 py-3 text-sm font-medium text-stone-800">{u.name}</td>
                                                <td className="px-5 py-3 text-sm text-stone-600">{u.email}</td>
                                                <td className="px-5 py-3">
                                                    <span className={cn(
                                                        'px-2 py-0.5 rounded-full text-xs font-bold uppercase',
                                                        u.role === 'ADMIN' ? 'bg-red-100 text-red-700' :
                                                        u.role === 'PRODUCER' ? 'bg-green-100 text-green-700' :
                                                        'bg-blue-100 text-blue-700'
                                                    )}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3 text-sm text-stone-500">{u.location}</td>
                                                <td className="px-5 py-3 text-sm text-stone-500">
                                                    {u.created_at ? format(new Date(u.created_at), 'MMM d, yyyy') : '—'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, sub, bg }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    sub?: string;
    bg?: string;
}) {
    return (
        <div className="bg-white border border-stone-100 rounded-2xl p-5 shadow-sm">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', bg ?? 'bg-stone-50')}>
                {icon}
            </div>
            <p className="text-2xl font-bold text-stone-800">{value}</p>
            <p className="text-sm text-stone-500 mt-0.5">{label}</p>
            {sub && <p className="text-xs text-stone-400 mt-1">{sub}</p>}
        </div>
    );
}
