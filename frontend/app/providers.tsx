'use client';

import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { LanguageProvider } from '../context/LanguageContext';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <LanguageProvider>
            <AuthProvider>
                <CartProvider>
                    {children}
                    <Toaster richColors position="top-center" />
                </CartProvider>
            </AuthProvider>
        </LanguageProvider>
    );
}
