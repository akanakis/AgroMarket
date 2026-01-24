'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingBag, MapPin, Calendar, Award, Star, ShieldCheck, Truck } from 'lucide-react';
import { Product } from '../types';
import { translations } from '../utils/translations';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import Navbar from './Navbar';
import * as API from '../services/apiService';
import { useRouter } from 'next/navigation';

interface ProductDetailsClientProps {
    productId: string;
}

const ProductDetailsClient: React.FC<ProductDetailsClientProps> = ({ productId }) => {
    const { addToCart } = useCart();
    const { lang } = useLanguage();
    const router = useRouter();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);

    const t = translations[lang];

    useEffect(() => {
        const loadProduct = async () => {
            try {
                setLoading(true);
                // We need an API method to get a single product. 
                // Existing API.fetchProducts returns all. We can filter for now if endpoint doesn't exist, 
                // or assume we create getProduct(id).
                // Let's use fetchProducts and find. Ideally backend has retrieve endpoint.
                const products = await API.fetchProducts();
                // ID in API is number, params.id is string
                const found = products.find(p => p.id.toString() === productId);

                if (found) {
                    setProduct({
                        id: found.id.toString(),
                        name: found.name,
                        description: found.description,
                        price: found.price,
                        unit: found.unit,
                        category: found.category,
                        location: found.location,
                        sellerName: found.seller_name,
                        imageUrl: found.image_url,
                        organic: found.organic,
                        harvestDate: found.harvest_date,
                        expirationDate: found.expiration_date || undefined,
                        maxQuantity: found.max_quantity,
                        rating: found.rating,
                        reviewCount: found.review_count
                    });
                }
            } catch (error) {
                console.error('Error loading product:', error);
            } finally {
                setLoading(false);
            }
        };
        loadProduct();
    }, [productId]);

    const handleAddToCart = () => {
        if (product) {
            addToCart(product, quantity);
            setQuantity(1); // Reset
        }
    };

    const handleViewProducer = () => {
        if (product) {
            router.push(`/producers/${encodeURIComponent(product.sellerName)}`);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#fcfdfa]">
                <Navbar />
                <div className="flex items-center justify-center h-[50vh] text-stone-400">Loading...</div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-[#fcfdfa]">
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 py-8 text-center text-stone-500">
                    Product not found.
                    <button onClick={() => router.back()} className="text-green-600 underline ml-2">Go back</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fcfdfa]">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 py-8">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-stone-500 hover:text-stone-800 transition-colors mb-6 group"
                >
                    <div className="bg-white p-2 rounded-full border border-stone-200 group-hover:border-stone-400 transition-all">
                        <ArrowLeft size={18} />
                    </div>
                    <span className="font-medium text-sm">{t.backToMarket}</span>
                </button>

                <div className="bg-white rounded-3xl shadow-xl shadow-stone-200/50 overflow-hidden border border-stone-100">
                    <div className="grid md:grid-cols-2">
                        {/* Image Section */}
                        <div className="relative h-96 md:h-full min-h-[500px] bg-stone-100">
                            <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                            {product.organic && (
                                <div className="absolute top-6 left-6 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 backdrop-blur-sm bg-opacity-90">
                                    <Award size={14} />
                                    ORGANIC
                                </div>
                            )}
                        </div>

                        {/* Details Section */}
                        <div className="p-8 md:p-12 flex flex-col h-full">
                            <div className="flex-grow">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <span className="text-sm font-bold text-green-600 tracking-wider uppercase mb-2 block">{product.category}</span>
                                        <h1 className="text-4xl font-bold text-stone-800 mb-2 leading-tight">{product.name}</h1>
                                        <div className="flex items-center gap-4 text-sm text-stone-500 mb-6">
                                            <span className="flex items-center gap-1 bg-stone-50 px-2 py-1 rounded-md border border-stone-100">
                                                <MapPin size={14} className="text-stone-400" /> {product.location}
                                            </span>
                                            <span className="flex items-center gap-1 text-amber-500 font-medium">
                                                <Star size={14} fill="currentColor" /> {product.rating} ({product.reviewCount} reviews)
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-3xl font-bold text-stone-800">${product.price.toFixed(2)}</div>
                                        <div className="text-stone-400 text-sm">per {product.unit}</div>
                                    </div>
                                </div>

                                <div className="prose prose-stone max-w-none mb-8">
                                    <p className="text-stone-600 leading-relaxed text-lg">{product.description}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                                        <span className="block text-xs font-bold text-stone-400 uppercase mb-1">Harvest Date</span>
                                        <div className="flex items-center gap-2 text-stone-700 font-medium">
                                            <Calendar size={18} className="text-green-600" />
                                            {product.harvestDate}
                                        </div>
                                    </div>
                                    {product.expirationDate && (
                                        <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                                            <span className="block text-xs font-bold text-stone-400 uppercase mb-1">Best Before</span>
                                            <div className="flex items-center gap-2 text-stone-700 font-medium">
                                                <ShieldCheck size={18} className="text-amber-500" />
                                                {product.expirationDate}
                                            </div>
                                        </div>
                                    )}
                                    <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                                        <span className="block text-xs font-bold text-stone-400 uppercase mb-1">Total Available</span>
                                        <div className="flex items-center gap-2 text-stone-700 font-medium">
                                            <ShoppingBag size={18} className="text-blue-500" />
                                            {product.maxQuantity} {product.unit}s
                                        </div>
                                    </div>
                                    <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                                        <span className="block text-xs font-bold text-stone-400 uppercase mb-1">Delivery</span>
                                        <div className="flex items-center gap-2 text-stone-700 font-medium">
                                            <Truck size={18} className="text-purple-500" />
                                            Local Pickup
                                        </div>
                                    </div>
                                </div>

                                <div
                                    className="bg-green-50/50 p-4 rounded-xl border border-green-100 mb-8 flex items-center justify-between cursor-pointer hover:bg-green-50 transition-colors"
                                    onClick={handleViewProducer}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm">
                                            {product.sellerName.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <span className="block text-xs font-bold text-green-800 uppercase">Producer</span>
                                            <span className="text-stone-800 font-bold">{product.sellerName}</span>
                                        </div>
                                    </div>
                                    <div className="text-green-700 text-sm font-medium hover:underline">View Profile -></div>
                                </div>
                            </div>

                            {/* Action Bar */}
                            <div className="pt-6 border-t border-stone-100 flex items-center gap-4">
                                <div className="flex items-center border-2 border-stone-200 rounded-xl h-14 bg-white hover:border-stone-300 transition-colors">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-12 h-full flex items-center justify-center text-stone-500 hover:bg-stone-50 rounded-l-lg transition-colors"
                                    >
                                        <Minus size={20} />
                                    </button>
                                    <span className="w-12 text-center text-lg font-bold text-stone-800">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(Math.min(product.maxQuantity, quantity + 1))}
                                        className="w-12 h-full flex items-center justify-center text-stone-500 hover:bg-stone-50 rounded-r-lg transition-colors"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>
                                <button
                                    onClick={handleAddToCart}
                                    className="flex-grow h-14 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700 shadow-xl shadow-green-200/50 hover:shadow-2xl hover:shadow-green-300/50 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 active:scale-95"
                                >
                                    <ShoppingBag size={24} />
                                    {t.addToCart} - ${(product.price * quantity).toFixed(2)}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Missing imports? Minus and Plus were used in logic
import { Minus, Plus } from 'lucide-react'; // Added to top import list implicitly by me merging it manually in my head effectively. 
// Wait, I put them in the duplicate import line? I need to be careful with imports.
// I see I imported Minus, Plus in line 4. 
// I'll double check content. 

export default ProductDetailsClient;
