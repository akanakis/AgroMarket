'use client';

import React from 'react';
import { Sprout, ArrowLeftRight, Package, UserCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { UserRole } from '../types';
import LanguageSelector from './LanguageSelector';

export default function Navbar() {
    const { role, userProfile, logout } = useAuth();
    const { lang, setLang } = useLanguage();

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
                        <button
                            className="flex items-center gap-2 text-sm text-stone-600 hover:text-green-700 bg-white hover:bg-green-50 px-3 py-1.5 rounded-full border border-stone-200 transition-all"
                        >
                            <Package size={16} />
                            <span className="hidden sm:inline">My Orders</span>
                        </button>
                    )}

                    {userProfile && (
                        <div className="hidden md:flex items-center gap-2 text-sm text-stone-600 bg-stone-50 px-3 py-1.5 rounded-full border border-stone-200">
                            <UserCircle size={16} />
                            <span>Viewing as: <span className="font-semibold text-stone-800">{userProfile.name}</span></span>
                        </div>
                    )}

                    {role && (
                        <button
                            onClick={() => logout()} // Or switch role
                            className="flex items-center gap-2 text-sm font-medium text-green-700 hover:bg-green-50 px-3 py-2 rounded-lg transition-colors"
                        >
                            <ArrowLeftRight size={16} />
                            <span className="hidden sm:inline">Switch Role</span>
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}
