import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../index.css'; // We'll keep using the existing Tailwind CSS file
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'AgroMarket - Farm to Table',
    description: 'Connect directly with local producers.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <Providers>
                    <div className="min-h-screen flex flex-col">
                        {/* We can conditionally render Navbar based on path, but for now render everywhere */}
                        {/* Actually, Landing page had its own header stuff? No, Landing had no header in App.tsx. 
                 App.tsx had header outside of views BUT Landing view logic was inside App.tsx return, 
                 and Header was outside logic. Wait.
                 In App.tsx:
                 if view === Landing -> return Landing (which has no navbar, complete override)
                 else -> return Shell with Navbar.
                 
                 So Navbar should NOT be in RootLayout if we want to match exactly, 
                 OR we update Landing to have Navbar.
                 The Landing page design is special.
                 Let's put Navbar in a separate component and use it in pages that need it, 
                 OR handle it in Layout with check.
                 For Next.js, Layout wraps everything.
                 I can create a (shop) layout group.
                 
                 For now, let's NOT put Navbar in RootLayout, but put it in specific pages/layouts.
                 I'll add it to MarketplacePageWrapper (or a SharedLayout).
                 
                 Let's keep RootLayout clean for now.
             */}
                        {children}
                    </div>
                </Providers>
            </body>
        </html>
    );
}
