'use client';

import React from 'react';
import { Sprout, Store, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { UserRole } from '../types';
import LanguageSelector from '../components/LanguageSelector';
// We'll need to move translations to a context or keep imports for now. 
// Importing works, but keeping state in App.tsx was the old way.
// For now, let's keep local state for lang in this component or make a context.
// Actually, LanguageSelector expects lang/setLang.
// I should probably make a LanguageContext too if I want it global.
// For this step, I'll just use local state to get it rendering, or add LanguageContext.
// Let's Add LanguageContext quickly in the next step. For now I'll stub it.

import { useState } from 'react';
import { Language, translations } from '../utils/translations';

export default function LandingPage() {
    const { login } = useAuth();
    const router = useRouter();
    const [lang, setLang] = useState<Language>('en');
    const t = translations[lang];

    const handleRoleSelect = (role: UserRole) => {
        login(role);
        if (role === UserRole.BUYER) {
            router.push('/marketplace');
        } else {
            router.push('/login'); // or /register
        }
    };

    return (
        <div className="min-h-screen bg-[#fcfdfa] flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute top-4 right-4 z-50">
                <LanguageSelector
                    lang={lang}
                    setLang={setLang}
                    buttonClassName="text-sm font-semibold text-stone-600 bg-white/50 px-3 py-1.5 rounded-full hover:bg-white border border-transparent hover:border-stone-200 shadow-sm"
                />
            </div>
            <div className="absolute top-0 left-0 w-full h-1/2 bg-green-50/50 -skew-y-3 transform origin-top-left -z-10"></div>

            <div className="text-center max-w-2xl mx-auto mb-12">
                <div className="flex justify-center mb-6">
                    <div className="bg-green-100 p-4 rounded-full shadow-lg shadow-green-100">
                        <Sprout size={48} className="text-green-600" />
                    </div>
                </div>
                <h1 className="text-5xl font-bold text-stone-800 mb-4 tracking-tight">{t.appTitle}</h1>
                <p className="text-xl text-stone-500 leading-relaxed">
                    {t.tagline}
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 w-full max-w-3xl">
                <button
                    onClick={() => handleRoleSelect(UserRole.BUYER)}
                    className="group relative bg-white border-2 border-green-100 hover:border-green-500 p-8 rounded-3xl text-left transition-all hover:shadow-xl hover:-translate-y-1"
                >
                    <div className="bg-green-50 w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-600 transition-colors">
                        <Store className="text-green-600 group-hover:text-white" size={24} />
                    </div>
                    <h3 className="text-2xl font-bold text-stone-800 mb-2">{t.buyBtn}</h3>
                    <p className="text-stone-500">{t.buyDesc}</p>
                </button>

                <button
                    onClick={() => handleRoleSelect(UserRole.PRODUCER)}
                    className="group relative bg-white border-2 border-amber-100 hover:border-amber-500 p-8 rounded-3xl text-left transition-all hover:shadow-xl hover:-translate-y-1"
                >
                    <div className="bg-amber-50 w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:bg-amber-500 transition-colors">
                        <Sprout className="text-amber-600 group-hover:text-white" size={24} />
                    </div>
                    <h3 className="text-2xl font-bold text-stone-800 mb-2">{t.sellBtn}</h3>
                    <p className="text-stone-500">{t.sellDesc}</p>
                </button>
            </div>
        </div>
    );
}
