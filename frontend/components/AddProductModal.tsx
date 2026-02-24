import React, { useState } from 'react';
import { X, Upload, Sprout } from 'lucide-react';
import * as API from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

interface AddProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onProductAdded: () => void;
    sellerId: number;
    sellerName: string;
}

export default function AddProductModal({ isOpen, onClose, onProductAdded, sellerId, sellerName }: AddProductModalProps) {
    const { accessToken } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        category: 'Vegetables',
        price: '',
        unit: 'kg',
        maxQuantity: '',
        description: '',
        location: '',
        harvestDate: '',
        imageUrl: '',
        organic: false
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Basic validation
            if (!formData.name || !formData.price || !formData.maxQuantity) {
                toast.error('Please fill in all required fields');
                setLoading(false);
                return;
            }

            if (!accessToken) {
                toast.error('You must be logged in to add a product');
                setLoading(false);
                return;
            }

            const productData = {
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                unit: formData.unit,
                category: formData.category,
                location: formData.location,
                image_url: formData.imageUrl || 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80',
                organic: formData.organic,
                harvest_date: formData.harvestDate,
                max_quantity: parseInt(formData.maxQuantity)
            };

            await API.createProduct(productData, accessToken);
            toast.success('Product listed successfully!');
            onProductAdded();
            onClose();
            // Reset form
            setFormData({
                name: '',
                category: 'Vegetables',
                price: '',
                unit: 'kg',
                maxQuantity: '',
                description: '',
                location: '',
                harvestDate: '',
                imageUrl: '',
                organic: false
            });
        } catch (error) {
            console.error('Error adding product:', error);
            toast.error('Failed to add product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="sticky top-0 bg-white border-b border-stone-100 p-6 flex items-center justify-between z-10">
                    <h2 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
                        <Sprout className="text-green-600" />
                        Add New Listing
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
                        <X size={20} className="text-stone-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Basic Info */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-stone-700">Product Name</label>
                            <input
                                type="text"
                                placeholder="e.g., Organic Tomatoes"
                                className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-stone-700">Category</label>
                            <select
                                className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option value="Vegetables">Vegetables</option>
                                <option value="Fruits">Fruits</option>
                                <option value="Dairy & Eggs">Dairy & Eggs</option>
                                <option value="Honey & Jams">Honey & Jams</option>
                                <option value="Herbs">Herbs</option>
                                <option value="Oil & Olives">Oil & Olives</option>
                            </select>
                        </div>
                    </div>

                    {/* Price & Quantity */}
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-stone-700">Price</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="w-full pl-8 pr-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    value={formData.price}
                                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-stone-700">Unit</label>
                            <select
                                className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                                value={formData.unit}
                                onChange={e => setFormData({ ...formData, unit: e.target.value })}
                            >
                                <option value="kg">kg</option>
                                <option value="g">g</option>
                                <option value="piece">piece</option>
                                <option value="bunch">bunch</option>
                                <option value="liter">liter</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-stone-700">Available Stock</label>
                            <input
                                type="number"
                                className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                                value={formData.maxQuantity}
                                onChange={e => setFormData({ ...formData, maxQuantity: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Details */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-stone-700">Location</label>
                            <input
                                type="text"
                                placeholder="Farm location..."
                                className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                                value={formData.location}
                                onChange={e => setFormData({ ...formData, location: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-stone-700">Harvest Date</label>
                            <input
                                type="date"
                                className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                                value={formData.harvestDate}
                                onChange={e => setFormData({ ...formData, harvestDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-stone-700">Description</label>
                        <textarea
                            rows={3}
                            className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                            placeholder="Describe your produce..."
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-stone-700">Image URL</label>
                        <div className="flex gap-2">
                            <input
                                type="url"
                                placeholder="https://..."
                                className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                                value={formData.imageUrl}
                                onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                            />
                            <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center border border-stone-200 overflow-hidden shrink-0">
                                {formData.imageUrl ? (
                                    <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <Upload size={16} className="text-stone-400" />
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="organic"
                            className="w-5 h-5 rounded border-stone-300 text-green-600 focus:ring-green-500"
                            checked={formData.organic}
                            onChange={e => setFormData({ ...formData, organic: e.target.checked })}
                        />
                        <label htmlFor="organic" className="text-sm font-medium text-stone-700">Certified Organic</label>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-stone-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 shadow-lg shadow-green-200/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Listing...' : 'List Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
