import React, { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { DollarSign, Package, TrendingUp, Plus, Edit, Trash2 } from 'lucide-react';
import { Product, Order } from '../types';
import { translations } from '../utils/translations';
import { useLanguage } from '../context/LanguageContext';

interface ProducerDashboardProps {
  products: Product[];
  orders: Order[];
  userProfile: any;
  onAddProduct: () => void;
  onDeleteProduct: (id: string) => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function ProducerDashboard({
  products,
  orders,
  userProfile,
  onAddProduct,
  onDeleteProduct
}: ProducerDashboardProps) {
  const { lang } = useLanguage();
  const t = translations[lang];

  // Stats Calculation
  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);
    const activeListings = products.length;
    const totalOrders = orders.length;

    return { totalRevenue, activeListings, totalOrders };
  }, [orders, products]);

  // Chart Data Preparation
  const chartData = useMemo(() => {
    // Revenue over time (mocking daily data from orders)
    // In real app, we'd group orders by date.
    const revenueByDate: Record<string, number> = {};
    orders.forEach(order => {
      // specific date format YYYY-MM-DD
      const date = new Date(order.date || Date.now()).toLocaleDateString('en-CA');
      revenueByDate[date] = (revenueByDate[date] || 0) + order.total;
    });

    const lineData = Object.keys(revenueByDate).map(date => ({
      date,
      amount: revenueByDate[date]
    })).sort((a, b) => a.date.localeCompare(b.date)).slice(-7); // Last 7 entries for demo

    // Sales by Category (derived from products for now as orders don't have item details in this simple view)
    // Ideally we look at order items. For now, let's show "Products by Category" distribution
    const productsByCategory: Record<string, number> = {};
    products.forEach(p => {
      productsByCategory[p.category] = (productsByCategory[p.category] || 0) + 1;
    });

    const pieData = Object.keys(productsByCategory).map(name => ({
      name,
      value: productsByCategory[name]
    }));

    return { lineData, pieData };
  }, [orders, products]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-stone-800">{userProfile?.farmName || 'Farm Dashboard'}</h1>
          <p className="text-stone-500">Manage your products and analyze performance</p>
        </div>
        <button
          onClick={onAddProduct}
          className="bg-green-600 text-white px-4 py-2 rounded-xl font-bold shadow-lg hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <Plus size={20} /> {t.addProduct}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-xl text-green-600">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-sm text-stone-500 font-medium uppercase">Total Revenue</p>
              <h3 className="text-2xl font-bold text-stone-800">${stats.totalRevenue.toFixed(2)}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
              <Package size={24} />
            </div>
            <div>
              <p className="text-sm text-stone-500 font-medium uppercase">{t.activeListings}</p>
              <h3 className="text-2xl font-bold text-stone-800">{stats.activeListings}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm text-stone-500 font-medium uppercase">{t.orders}</p>
              <h3 className="text-2xl font-bold text-stone-800">{stats.totalOrders}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
          <h3 className="text-lg font-bold text-stone-800 mb-4">Revenue Trend</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData.lineData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#16A34A"
                  strokeWidth={3}
                  dot={{ fill: '#16A34A', strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution Check */}
        <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
          <h3 className="text-lg font-bold text-stone-800 mb-4">Products by Category</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData.pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden mb-8">
        <div className="p-6 border-b border-stone-100">
          <h3 className="text-xl font-bold text-stone-800">{t.myProducts}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-stone-50 text-stone-500 text-sm font-semibold uppercase">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                      <span className="font-medium text-stone-800">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-stone-600">{p.category}</td>
                  <td className="px-6 py-4 font-medium text-stone-800">${p.price}</td>
                  <td className="px-6 py-4 text-stone-600">{p.maxQuantity} {p.unit}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${p.maxQuantity > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {p.maxQuantity > 0 ? 'Active' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-stone-100 rounded-lg text-stone-500 hover:text-stone-800 transition-colors">
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => onDeleteProduct(p.id)}
                        className="p-2 hover:bg-stone-100 rounded-lg text-stone-500 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}