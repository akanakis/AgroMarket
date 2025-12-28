import React, { useState } from 'react';
import { Product } from '../types';
import { MapPin, Leaf, ShoppingBasket, ChefHat, Loader2, Info, Calendar, Pencil, Trash2, Plus, Minus, Star, AlertTriangle, Clock } from 'lucide-react';
import { generateRecipeSuggestion } from '../services/geminiService';
import { translations, Language } from '../utils/translations';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product, quantity: number) => void;
  isProducerView?: boolean;
  lang: Language;
  onEdit?: (product: Product) => void;
  onDelete?: (id: string) => void;
  onViewProduct?: (product: Product) => void;
  onViewProducer?: (sellerName: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onAddToCart, 
  isProducerView = false, 
  lang, 
  onEdit, 
  onDelete,
  onViewProduct,
  onViewProducer
}) => {
  const [recipe, setRecipe] = useState<string | null>(null);
  const [loadingRecipe, setLoadingRecipe] = useState(false);
  const [quantity, setQuantity] = useState<number | string>(1);
  const t = translations[lang];

  const handleGetRecipe = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoadingRecipe(true);
    const suggestion = await generateRecipeSuggestion(product.name);
    setRecipe(suggestion);
    setLoadingRecipe(false);
  };

  const getQuantityNum = () => (typeof quantity === 'string' ? parseInt(quantity) || 1 : quantity);

  const increment = (e: React.MouseEvent) => {
    e.stopPropagation();
    const current = getQuantityNum();
    if (current < product.maxQuantity) setQuantity(current + 1);
  };

  const decrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    const current = getQuantityNum();
    if (current > 1) setQuantity(current - 1);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const val = e.target.value;
    if (val === '') {
      setQuantity('');
      return;
    }
    const num = parseInt(val);
    if (!isNaN(num)) {
       setQuantity(num);
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    e.stopPropagation();
    let num = getQuantityNum();
    if (num < 1) num = 1;
    if (num > product.maxQuantity) num = product.maxQuantity;
    setQuantity(num);
  };

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart?.(product, getQuantityNum());
    setQuantity(1); 
  };
  
  const handleSellerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onViewProducer && !isProducerView) {
      onViewProducer(product.sellerName);
    }
  };

  const handleCardClick = () => {
    if (onViewProduct && !isProducerView) {
      onViewProduct(product);
    }
  };

  // Determine Spoilage Warning
  const getSpoilageStatus = () => {
    if (!product.expirationDate) return null;
    const today = new Date();
    // Normalize today to start of day
    today.setHours(0,0,0,0);
    const expDate = new Date(product.expirationDate);
    // Normalize exp to start of day
    expDate.setHours(0,0,0,0);
    
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { type: 'expired', label: t.expired, color: 'text-red-600 bg-red-50 border-red-200' };
    if (diffDays <= 7) return { type: 'soon', label: `${t.expiresSoon} (${diffDays}d)`, color: 'text-amber-600 bg-amber-50 border-amber-200' };
    return null;
  };

  const spoilage = getSpoilageStatus();
  const displayCategory = t.categories[product.category as keyof typeof t.categories] || product.category;

  return (
    <div 
      onClick={handleCardClick}
      className={`bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col h-full group ${!isProducerView && onViewProduct ? 'cursor-pointer' : ''}`}
    >
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {product.organic && (
          <div className="absolute top-3 right-3 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm backdrop-blur-sm bg-opacity-90">
            <Leaf size={12} /> {t.organic}
          </div>
        )}
        
        {isProducerView && (
          <div className="absolute top-3 left-3 flex gap-2">
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit?.(product); }}
              className="bg-white/90 hover:bg-white text-stone-700 p-1.5 rounded-full shadow-md transition-all"
              title={t.edit}
            >
              <Pencil size={14} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete?.(product.id); }}
              className="bg-red-50/90 hover:bg-red-100 text-red-600 p-1.5 rounded-full shadow-md transition-all"
              title={t.delete}
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-4">
           <h3 className="text-white font-bold text-lg leading-tight shadow-sm group-hover:underline decoration-white/50 underline-offset-4">{product.name}</h3>
           <p className="text-white/95 text-sm flex items-center gap-1.5 mt-1 font-medium">
             <MapPin size={14} className="text-amber-400" /> {product.location}
           </p>
        </div>
      </div>

      <div className="p-4 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-3">
           <div className="flex flex-col">
             <span className="text-xs font-bold text-green-600 uppercase tracking-wider bg-green-50 px-2 py-0.5 rounded-md self-start mb-1">{displayCategory}</span>
             
             {/* Expiration / Harvest Info */}
             <div className="flex flex-col gap-1">
               <div className="flex items-center gap-1 text-xs text-stone-500">
                  <Calendar size={12}/> {t.harvested}: {product.harvestDate}
               </div>
               {spoilage ? (
                  <div className={`flex items-center gap-1 text-xs font-bold px-1.5 py-0.5 rounded border ${spoilage.color} w-fit`}>
                    <AlertTriangle size={10}/> {spoilage.label}
                  </div>
               ) : product.expirationDate && (
                  <div className="flex items-center gap-1 text-xs text-stone-400">
                     <Clock size={12}/> Exp: {product.expirationDate}
                  </div>
               )}
             </div>

           </div>
           <div className="text-right">
             <div className="text-stone-800 font-bold text-lg">${product.price.toFixed(2)} <span className="text-sm text-stone-400 font-normal">/ {product.unit}</span></div>
             <div className="flex items-center justify-end gap-1 mt-1">
               <Star size={12} className="fill-amber-400 text-amber-400" />
               <span className="text-xs font-semibold text-stone-700">{product.rating.toFixed(1)}</span>
               <span className="text-[10px] text-stone-400">({product.reviewCount})</span>
             </div>
           </div>
        </div>

        <p className="text-stone-600 text-sm mb-4 leading-relaxed line-clamp-3">
          {product.description}
        </p>

        {isProducerView && (
           <div className="mb-4 text-xs text-stone-500 font-medium bg-stone-50 p-2 rounded border border-stone-100">
             Stock: {product.maxQuantity} {product.unit}s
           </div>
        )}

        {/* Display Recipe if available */}
        {recipe && (
          <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-100 text-xs text-stone-700 animate-in fade-in zoom-in-95 duration-300">
             <div className="flex items-center gap-1 font-bold text-amber-800 mb-1">
               <ChefHat size={12}/> Chef's Suggestion:
             </div>
             {recipe}
          </div>
        )}

        <div className="mt-auto pt-4 border-t border-stone-100" onClick={(e) => e.stopPropagation()}>
           {!isProducerView && (
             <div className="flex gap-2">
               <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden bg-white shadow-sm w-28">
                  <button onClick={decrement} className="px-2 py-2 hover:bg-stone-100 text-stone-600 transition-colors border-r border-stone-100 flex items-center justify-center"><Minus size={14}/></button>
                  <input 
                    type="number"
                    value={quantity}
                    onChange={handleQuantityChange}
                    onBlur={handleBlur}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full text-center text-sm font-semibold text-stone-700 outline-none p-0 bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button onClick={increment} className="px-2 py-2 hover:bg-stone-100 text-stone-600 transition-colors border-l border-stone-100 flex items-center justify-center"><Plus size={14}/></button>
               </div>
               <button
                 onClick={handleAddToCartClick}
                 disabled={spoilage?.type === 'expired'}
                 className={`flex-1 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-sm ${spoilage?.type === 'expired' ? 'bg-stone-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
               >
                 <ShoppingBasket size={16} /> {t.addToCart}
               </button>
             </div>
           )}
           
           {isProducerView && (
             <div className="flex items-center justify-center text-stone-400 text-sm gap-2 bg-stone-50 py-2 rounded-lg">
                <Info size={14}/> {t.previewMode}
             </div>
           )}
           
           <div className="flex justify-between items-center mt-3">
             <div className="flex items-center gap-2 text-xs text-stone-500">
               <div className="w-6 h-6 rounded-full bg-stone-200 flex items-center justify-center text-stone-600 font-bold border border-stone-300">
                 {product.sellerName.charAt(0)}
               </div>
               <span onClick={handleSellerClick} className={`${!isProducerView ? 'cursor-pointer hover:text-green-700 hover:underline' : ''} transition-colors`}>
                  {t.soldBy} <span className="font-semibold text-stone-700">{product.sellerName}</span>
               </span>
             </div>
             
             {!isProducerView && (
               <button
                 onClick={handleGetRecipe}
                 disabled={loadingRecipe}
                 className="text-amber-600 hover:text-amber-800 p-1.5 rounded-full hover:bg-amber-50 transition-colors"
                 title="Get AI Recipe Suggestion"
               >
                 {loadingRecipe ? <Loader2 size={16} className="animate-spin" /> : <ChefHat size={16} />}
               </button>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;