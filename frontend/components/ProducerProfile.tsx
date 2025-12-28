import React from 'react';
import { Product } from '../types';
import { translations, Language } from '../utils/translations';
import { ArrowLeft, MapPin, Award, Phone, Mail, Tractor, Star, MessageSquare } from 'lucide-react';
import ProductCard from './ProductCard';

interface ProducerProfileProps {
  sellerName: string;
  allProducts: Product[];
  onBack: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onViewProduct: (product: Product) => void;
  lang: Language;
}

const ProducerProfile: React.FC<ProducerProfileProps> = ({ sellerName, allProducts, onBack, onAddToCart, onViewProduct, lang }) => {
  const t = translations[lang];

  // Filter products for this producer
  const producerProducts = allProducts.filter(p => p.sellerName === sellerName);
  
  // Use the first product to get shared location info (Mocking data consistency)
  const producerInfo = producerProducts[0] || { location: 'Greece' };

  // Calculate dynamic stats
  const totalReviews = producerProducts.reduce((acc, p) => acc + p.reviewCount, 0);
  const averageRating = totalReviews > 0
    ? producerProducts.reduce((acc, p) => acc + (p.rating * p.reviewCount), 0) / totalReviews
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-stone-600 hover:text-green-700 mb-6 font-medium transition-colors"
      >
        <ArrowLeft size={20} /> {t.backToMarket}
      </button>

      {/* Hero Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden mb-12">
        <div className="h-48 bg-gradient-to-r from-green-600 to-green-800 relative">
          <div className="absolute -bottom-12 left-8 w-24 h-24 bg-white rounded-full p-2 shadow-lg">
             <div className="w-full h-full bg-stone-100 rounded-full flex items-center justify-center text-3xl font-bold text-stone-400">
               {sellerName.charAt(0)}
             </div>
          </div>
        </div>
        
        <div className="pt-16 pb-8 px-8">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
             <div>
               <h1 className="text-3xl font-bold text-stone-800 mb-2">{sellerName}</h1>
               <div className="flex items-center gap-2 text-stone-500 mb-4">
                 <MapPin size={18} /> {producerInfo.location}
               </div>
               <p className="max-w-2xl text-stone-600 leading-relaxed">
                 A dedicated local producer committed to sustainable farming practices. 
                 Bringing the freshest seasonal harvest directly to your table with love and care for the land.
               </p>
             </div>
             
             <div className="flex gap-4">
                <div className="bg-amber-50 px-4 py-3 rounded-xl border border-amber-100 flex flex-col items-center min-w-[100px]">
                  <span className="font-bold text-2xl text-amber-600">{producerProducts.length}</span>
                  <span className="text-xs text-amber-800 uppercase font-bold flex items-center gap-1"><Tractor size={12}/> Products</span>
                </div>
                <div className="bg-green-50 px-4 py-3 rounded-xl border border-green-100 flex flex-col items-center min-w-[100px]">
                  <span className="font-bold text-2xl text-green-600">{averageRating.toFixed(1)}</span>
                  <span className="text-xs text-green-800 uppercase font-bold flex items-center gap-1"><Star size={12}/> Rating</span>
                </div>
                 <div className="bg-blue-50 px-4 py-3 rounded-xl border border-blue-100 flex flex-col items-center min-w-[100px]">
                  <span className="font-bold text-2xl text-blue-600">{totalReviews}</span>
                  <span className="text-xs text-blue-800 uppercase font-bold flex items-center gap-1"><MessageSquare size={12}/> Reviews</span>
                </div>
             </div>
           </div>

           <div className="mt-8 pt-8 border-t border-stone-100 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-stone-800 mb-3 flex items-center gap-2">
                  <Award className="text-green-600" size={20} /> {t.certifications}
                </h3>
                <div className="flex gap-2 flex-wrap">
                  <span className="px-3 py-1 bg-stone-100 rounded-full text-sm text-stone-600 border border-stone-200">Organic Certified</span>
                  <span className="px-3 py-1 bg-stone-100 rounded-full text-sm text-stone-600 border border-stone-200">Local Grown</span>
                  <span className="px-3 py-1 bg-stone-100 rounded-full text-sm text-stone-600 border border-stone-200">Sustainable</span>
                </div>
              </div>
              
              <div>
                <h3 className="font-bold text-stone-800 mb-3 flex items-center gap-2">
                   <Phone className="text-green-600" size={20} /> {t.contact}
                </h3>
                <div className="space-y-2 text-sm text-stone-600">
                   <div className="flex items-center gap-2"><Phone size={14}/> +30 210 1234567</div>
                   <div className="flex items-center gap-2"><Mail size={14}/> contact@{sellerName.toLowerCase().replace(/\s/g, '').replace(/[^a-z0-9]/g, '')}.com</div>
                </div>
              </div>
           </div>
        </div>
      </div>

      {/* Products Grid */}
      <h2 className="text-2xl font-bold text-stone-800 mb-6">{t.otherProducts}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {producerProducts.map(p => (
           // Note: We use onViewProduct but disable navigation to ProducerProfile from within ProducerProfile to avoid recursion/redundancy
           <ProductCard 
             key={p.id} 
             product={p} 
             onAddToCart={onAddToCart} 
             lang={lang} 
             onViewProduct={onViewProduct}
           />
        ))}
      </div>
    </div>
  );
};

export default ProducerProfile;