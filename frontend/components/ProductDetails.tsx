import React, { useState } from 'react';
import { Product, Review } from '../types';
import { translations, Language } from '../utils/translations';
import { ArrowLeft, MapPin, Calendar, Star, ShoppingBasket, Leaf, Plus, Minus, User, Truck, AlertTriangle, Clock } from 'lucide-react';

interface ProductDetailsProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onViewProducer: (sellerName: string) => void;
  lang: Language;
}

const MOCK_REVIEWS: Review[] = [
  { id: '1', author: 'Maria K.', rating: 5, comment: 'Absolutely delicious! Tastes just like my grandmother used to make.', date: '2024-05-12' },
  { id: '2', author: 'John D.', rating: 4, comment: 'Very fresh and fast delivery. Will buy again.', date: '2024-06-01' },
  { id: '3', author: 'Eleni S.', rating: 5, comment: 'Best quality I have found in the area.', date: '2024-06-15' },
];

const ProductDetails: React.FC<ProductDetailsProps> = ({ product, onBack, onAddToCart, onViewProducer, lang }) => {
  const t = translations[lang];
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  // Mock multiple images by using the main image
  const images = [
    product.imageUrl,
    product.imageUrl + '&blur=2', // Just to make them look slightly different in mock
    product.imageUrl + '&grayscale',
  ];

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    setQuantity(1);
  };
  
  // Determine Spoilage Warning
  const getSpoilageStatus = () => {
    if (!product.expirationDate) return null;
    const today = new Date();
    today.setHours(0,0,0,0);
    const expDate = new Date(product.expirationDate);
    expDate.setHours(0,0,0,0);
    
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { type: 'expired', label: t.expired, color: 'text-red-700 bg-red-100 border-red-200' };
    if (diffDays <= 7) return { type: 'soon', label: `${t.expiresSoon} (${diffDays} days)`, color: 'text-amber-700 bg-amber-100 border-amber-200' };
    return null;
  };

  const spoilage = getSpoilageStatus();
  const displayCategory = t.categories[product.category as keyof typeof t.categories] || product.category;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-stone-600 hover:text-green-700 mb-6 font-medium transition-colors"
      >
        <ArrowLeft size={20} /> {t.backToMarket}
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images Section */}
        <div className="space-y-4">
          <div className="aspect-square bg-stone-100 rounded-2xl overflow-hidden shadow-lg border border-stone-200">
            <img 
              src={images[activeImage]} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {images.map((img, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={`w-24 h-24 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${activeImage === idx ? 'border-green-600 ring-2 ring-green-100' : 'border-transparent opacity-70 hover:opacity-100'}`}
              >
                <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info Section */}
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs font-bold text-green-600 uppercase tracking-wider bg-green-50 px-2 py-1 rounded-md">
              {displayCategory}
            </span>
            {product.organic && (
              <span className="text-xs font-bold text-white uppercase tracking-wider bg-green-600 px-2 py-1 rounded-md flex items-center gap-1">
                <Leaf size={12} /> {t.organic}
              </span>
            )}
            {spoilage && (
              <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md flex items-center gap-1 ${spoilage.color}`}>
                 <AlertTriangle size={12} /> {spoilage.label}
              </span>
            )}
          </div>

          <h1 className="text-4xl font-bold text-stone-800 mb-2">{product.name}</h1>
          
          <div className="flex items-center gap-4 mb-6 text-sm">
             <div className="flex items-center gap-1 text-amber-500">
               <Star size={18} fill="currentColor" />
               <span className="font-bold text-stone-800 text-lg">{product.rating.toFixed(1)}</span>
               <span className="text-stone-400">({product.reviewCount} {t.reviews})</span>
             </div>
             <div className="w-px h-4 bg-stone-300"></div>
             <button onClick={() => onViewProducer(product.sellerName)} className="flex items-center gap-1 text-green-700 font-medium hover:underline">
               <User size={16} /> {product.sellerName}
             </button>
          </div>

          <div className="text-3xl font-bold text-stone-800 mb-6">
            ${product.price.toFixed(2)} <span className="text-lg text-stone-400 font-normal">/ {product.unit}</span>
          </div>

          <p className="text-stone-600 text-lg leading-relaxed mb-8">
            {product.description}
          </p>

          <div className="bg-stone-50 rounded-xl p-6 mb-8 space-y-3 border border-stone-100">
             <div className="flex items-center gap-3 text-stone-600">
               <MapPin size={20} className="text-amber-500" />
               <span className="font-medium">{t.location}:</span>
               <span>{product.location}</span>
             </div>
             <div className="flex items-center gap-3 text-stone-600">
               <Calendar size={20} className="text-amber-500" />
               <span className="font-medium">{t.harvested}:</span>
               <span>{product.harvestDate}</span>
             </div>
             {product.expirationDate && (
              <div className="flex items-center gap-3 text-stone-600">
                 <Clock size={20} className={spoilage ? "text-red-500" : "text-amber-500"} />
                 <span className="font-medium">{t.expirationDate}:</span>
                 <span className={spoilage ? "font-bold text-red-600" : ""}>{product.expirationDate}</span>
              </div>
             )}
             <div className="flex items-center gap-3 text-stone-600">
               <Truck size={20} className="text-amber-500" />
               <span className="font-medium">Stock:</span>
               <span>{product.maxQuantity} {product.unit}s available</span>
             </div>
          </div>

          {/* Add to Cart Actions */}
          <div className="flex gap-4 mb-10">
            <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden bg-white h-12 shadow-sm">
               <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 h-full hover:bg-stone-50 text-stone-600 transition-colors flex items-center justify-center border-r border-stone-100"><Minus size={18}/></button>
               <input 
                 type="number"
                 value={quantity}
                 onChange={(e) => setQuantity(Math.min(product.maxQuantity, Math.max(1, parseInt(e.target.value) || 1)))}
                 className="w-16 text-center font-semibold text-lg text-stone-700 outline-none h-full bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
               />
               <button onClick={() => setQuantity(Math.min(product.maxQuantity, quantity + 1))} className="px-4 h-full hover:bg-stone-50 text-stone-600 transition-colors flex items-center justify-center border-l border-stone-100"><Plus size={18}/></button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={spoilage?.type === 'expired'}
              className={`flex-1 text-white text-lg font-bold rounded-xl shadow-lg shadow-green-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${spoilage?.type === 'expired' ? 'bg-stone-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
            >
              <ShoppingBasket size={24} /> {t.addToCart}
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-16 border-t border-stone-200 pt-10">
        <h2 className="text-2xl font-bold text-stone-800 mb-6 flex items-center gap-2">
          <Star className="text-amber-400" fill="currentColor" /> {t.reviews}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_REVIEWS.map(review => (
            <div key={review.id} className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div className="font-bold text-stone-800">{review.author}</div>
                <div className="text-xs text-stone-400">{review.date}</div>
              </div>
              <div className="flex gap-1 mb-3">
                 {[...Array(5)].map((_, i) => (
                   <Star key={i} size={14} className={i < review.rating ? "text-amber-400 fill-amber-400" : "text-stone-200"} />
                 ))}
              </div>
              <p className="text-stone-600 text-sm leading-relaxed">"{review.comment}"</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;