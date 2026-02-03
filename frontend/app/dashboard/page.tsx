import { Suspense } from 'react';
import DashboardClient from '../../components/DashboardClient';

import { DashboardSkeleton } from '@/components/skeletons';

export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-[#fcfdfa]">
            <Suspense fallback={<DashboardSkeleton />}>
                <DashboardClient />
            </Suspense>
        </div>
    );
}
