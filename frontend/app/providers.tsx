'use client';

import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { LanguageProvider } from '../context/LanguageContext';
import GlobalWebSocket from '../components/GlobalWebSocket';
import { Toaster } from 'sonner';
import { GoogleOAuthProvider } from '@react-oauth/google';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'dummy'}>
            <QueryClientProvider client={queryClient}>
                <LanguageProvider>
                    <AuthProvider>
                        <CartProvider>
                            <GlobalWebSocket />
                            {children}
                            <Toaster richColors position="top-center" />
                        </CartProvider>
                    </AuthProvider>
                </LanguageProvider>
            </QueryClientProvider>
        </GoogleOAuthProvider>
    );
}
