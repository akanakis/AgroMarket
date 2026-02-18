'use client';

import React from 'react';
import { Sprout, LogOut, Package, UserCircle, Store, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { UserRole } from '../types';
import LanguageSelector from './LanguageSelector';

export default function Navbar() {
    const { role, userProfile, logout, login } = useAuth();
    const { lang, setLang } = useLanguage();
    const router = useRouter();

    const handleSellerLogin = () => {
        login(UserRole.PRODUCER);
        router.push('/dashboard');
    };

    const handleBuyerLogin = () => {
        login(UserRole.BUYER);
        // Stays on the same page (Marketplace)
    };

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    return (
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-stone-100">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 cursor-pointer">
                    <Sprout className="text-green-600" size={24} />
                    <span className="font-bold text-xl text-stone-800 tracking-tight">AgroMarket</span>
                </Link>

                <div className="flex items-center gap-4">
                    <LanguageSelector
                        lang={lang}
                        setLang={setLang}
                        buttonClassName="text-sm font-semibold text-stone-600 bg-stone-50 px-3 py-1.5 rounded-full hover:bg-stone-100 border border-transparent"
                    />

                    {role === UserRole.BUYER && (
                        <Link
                            href="/orders"
                            className="flex items-center gap-2 text-sm text-stone-600 hover:text-green-700 bg-white hover:bg-green-50 px-3 py-1.5 rounded-full border border-stone-200 transition-all"
                        >
                            <Package size={16} />
                            <span className="hidden sm:inline">My Orders</span>
                        </Link>
                    )}

                    {userProfile && (
                        <div className="hidden md:flex items-center gap-2 text-sm text-stone-600 bg-stone-50 px-3 py-1.5 rounded-full border border-stone-200">
                            <UserCircle size={16} />
                            <span>Viewing as: <span className="font-semibold text-stone-800">{userProfile.name}</span></span>
                        </div>
                    )}

                    {!role && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleBuyerLogin}
                                className="flex items-center gap-2 text-sm font-bold text-stone-600 hover:text-green-700 px-3 py-2 rounded-lg transition-colors"
                            >
                                <User size={18} />
                                <span className="hidden sm:inline">Login</span>
                            </button>
                            <button
                                onClick={handleSellerLogin}
                                className="flex items-center gap-2 text-sm font-bold text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-full shadow-md transition-colors"
                            >
                                <Store size={18} />
                                <span className="hidden sm:inline">Login as Seller</span>
                            </button>
                        </div>
                    )}

                    {role && (
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-sm font-medium text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
                        >
                            <LogOut size={16} />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}
