import { Suspense } from 'react';
import MarketplaceClient from '../../components/MarketplaceClient';
import * as API from '../../services/apiService';

// This is a Server Component
export default async function MarketplacePage() {
    // In a real Server Component, you'd fetch data here directly.
    // For now, to reuse the existing API service (which might rely on fetch), we can try to call it.
    // However, API service uses 'http://localhost:8000' which might fail inside Docker container (needs 'http://backend:8000').
    // For the first iteration of migration, we'll keep data fetching on the client (inside MarketplaceClient) 
    // to minimize breakage until we configure Docker networking for SSR.

    return (
        <div className="min-h-screen bg-[#fcfdfa]">
            {/* Navbar is in Layout, but wait, Layout has the Navbar? 
           No, I didn't put Navbar in RootLayout yet! 
           I need to add Navbar to RootLayout or individual pages. 
           In App.tsx Navbar was global. I should probably move it to RootLayout. 
       */}
            <Suspense fallback={<div>Loading...</div>}>
                <MarketplaceClient />
            </Suspense>
        </div>
    );
}
