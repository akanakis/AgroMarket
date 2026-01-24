'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Award, Star } from 'lucide-react';
import { Product } from '../types';
import ProductCard from './ProductCard';
import { translations } from '../utils/translations';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import Navbar from './Navbar';
import * as API from '../services/apiService';
import { useRouter } from 'next/navigation';

interface ProducerProfileClientProps {
    sellerName: string;
}

const ProducerProfileClient: React.FC<ProducerProfileClientProps> = ({ sellerName }) => {
    const { addToCart } = useCart();
    const { lang } = useLanguage();
    const router = useRouter();

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const t = translations[lang];

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const data = await API.fetchProducts();

                // Filter by seller name
                const producerProducts = data.filter(p => p.seller_name === sellerName).map(p => ({
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
                setProducts(producerProducts);
            } catch (error) {
                console.error('Error loading producer data:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [sellerName]);

    const handleViewProduct = (product: Product) => {
        router.push(`/products/${product.id}`);
    };

    // We are already on producer profile, so handleViewProducer can just scroll top or do nothing.
    const handleViewProducer = () => {
        window.scrollTo(0, 0);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#fcfdfa]">
                <Navbar />
                <div className="flex items-center justify-center h-[50vh] text-stone-400">Loading...</div>
            </div>
        );
    }

    // Calculate stats
    const totalReviews = products.reduce((acc, p) => acc + (p.reviewCount || 0), 0);
    const avgRating = products.length > 0
        ? (products.reduce((acc, p) => acc + (p.rating || 0), 0) / products.length).toFixed(1)
        : 'New';

    // Get location/cert from first product (approximation since we don't have producer endpoint yet)
    const location = products[0]?.location || 'Unknown Location';
    // Check if any product is organic
    const isOrganicCertified = products.some(p => p.organic);

    return (
        <div className="min-h-screen bg-[#fcfdfa]">
            <Navbar />

            {/* Cover Image */}
            <div className="h-64 bg-green-800 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center opacity-40"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#fcfdfa] to-transparent"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 -mt-32 relative z-10">
                <button
                    onClick={() => router.back()}
                    className="absolute top-[-40px] left-4 text-white/80 hover:text-white flex items-center gap-2 font-medium"
                >
                    <ArrowLeft size={18} /> {t.backToMarket}
                </button>

                <div className="bg-white rounded-3xl shadow-xl p-8 mb-12 border border-stone-100">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                        <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-3xl border-4 border-white shadow-lg">
                            {sellerName.substring(0, 2).toUpperCase()}
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold text-stone-800">{sellerName}</h1>
                                {isOrganicCertified && <Award className="text-green-600" size={24} />}
                            </div>

                            <div className="flex flex-wrap gap-4 text-stone-500">
                                <div className="flex items-center gap-1">
                                    <MapPin size={16} /> {location}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Star size={16} className="text-amber-500" fill="currentColor" />
                                    <span className="font-bold text-stone-700">{avgRating}</span> ({totalReviews} reviews)
                                </div>
                                <div className="flex items-center gap-1">
                                    <Award size={16} className="text-green-600" />
                                    {isOrganicCertified ? 'Organic Certified' : 'Local Producer'}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-4 md:mt-0">
                            <div className="text-center px-6 py-3 bg-stone-50 rounded-xl border border-stone-100">
                                <div className="text-2xl font-bold text-stone-800">{products.length}</div>
                                <div className="text-xs text-stone-500 font-semibold uppercase">Products</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-stone-800 mb-6 flex items-center gap-2">
                        <Award size={24} className="text-green-600" />
                        Active Listings
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.length === 0 ? (
                            <div className="col-span-full py-12 text-center text-stone-400">
                                No products listed currently.
                            </div>
                        ) : (
                            products.map(p => (
                                <ProductCard
                                    key={p.id}
                                    product={p}
                                    onAddToCart={addToCart}
                                    lang={lang}
                                    onViewProduct={handleViewProduct}
                                    onViewProducer={handleViewProducer}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProducerProfileClient;
