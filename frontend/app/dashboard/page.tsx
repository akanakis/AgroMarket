import { Suspense } from 'react';
import DashboardClient from '../../components/DashboardClient';

export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-[#fcfdfa]">
            <Suspense fallback={<div>Loading...</div>}>
                <DashboardClient />
            </Suspense>
        </div>
    );
}
