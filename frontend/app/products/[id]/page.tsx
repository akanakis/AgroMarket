import { Suspense } from 'react';
import ProductDetailsClient from '../../components/ProductDetailsClient';
// import { Metadata } from 'next';

interface Props {
    params: { id: string };
    searchParams: { [key: string]: string | string[] | undefined };
}

// SEO Metadata (Example)
// export async function generateMetadata({ params }: Props): Promise<Metadata> {
//   return { title: `Product ${params.id}` };
// }

export default function ProductPage({ params }: Props) {
    // In a real app, fetch product data here to pass as initialData.
    // const product = await getProduct(params.id);

    return (
        <div className="min-h-screen bg-[#fcfdfa]">
            <Suspense fallback={<div>Loading...</div>}>
                <ProductDetailsClient productId={params.id} />
            </Suspense>
        </div>
    );
}
