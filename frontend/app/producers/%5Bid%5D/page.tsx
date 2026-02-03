import { Suspense } from 'react';
import ProducerProfileClient from '@/components/ProducerProfileClient';

interface Props {
    params: { id: string }; // In routing we used sellerName which is encoded string
}

export default function ProducerPage({ params }: Props) {
    const sellerName = decodeURIComponent(params.id);

    return (
        <div className="min-h-screen bg-[#fcfdfa]">
            <Suspense fallback={<div>Loading...</div>}>
                <ProducerProfileClient sellerName={sellerName} />
            </Suspense>
        </div>
    );
}
