
import { Suspense } from 'react';
import MarketplaceClient from '../components/MarketplaceClient';

import { ProductGridSkeleton } from '@/components/skeletons';

export default function Home() {
    return (
        <div className="min-h-screen bg-[#fcfdfa]">
            <Suspense fallback={<ProductGridSkeleton />}>
                <MarketplaceClient />
            </Suspense>
        </div>
    );
}
