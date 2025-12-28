import React, { useState, useMemo } from 'react';
import { Product, CartItem } from '../types';
import { Search, SlidersHorizontal, ShoppingBag, Trash2, Plus, Minus, Filter, X, AlertTriangle } from 'lucide-react';
import ProductCard from './ProductCard';
import { translations, Language } from '../utils/translations';

interface MarketplaceProps {
  products: Product[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, delta: number) => void;
  cart: CartItem[];
  lang: Language;
  onCheckout: () => void;
  onViewProduct: (product: Product) => void;
  onViewProducer: (sellerName: string) => void;
}

const CATEGORIES = ['All', 'Vegetables', 'Fruits', 'Dairy & Eggs', 'Honey & Jams', 'Herbs', 'Oil & Olives'];

const Marketplace: React.FC<MarketplaceProps> = ({ 
  products, 
  addToCart, 
  removeFromCart, 
  updateCartQuantity, 
  cart, 
  lang, 
  onCheckout,
  onViewProduct,
  onViewProducer
}) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [organicOnly, setOrganicOnly] = useState(false);
  const [showExpired, setShowExpired] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  
  const t = translations[lang];

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Category Filter
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      
      // Search Filter
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            product.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Organic Filter
      const matchesOrganic = organicOnly ? product.organic : true;
      
      // Price Filter
      const price = product.price;
      const min = priceRange.min ? parseFloat(priceRange.min) : 0;
      const max = priceRange.max ? parseFloat(priceRange.max) : Infinity;
      const matchesPrice = price >= min && price <= max;

      // Expiration Filter (Hide expired by default)
      let matchesExpiration = true;
      if (!showExpired && product.expirationDate) {
         const today = new Date();
         today.setHours(0,0,0,0);
         const exp = new Date(product.expirationDate);
         exp.setHours(0,0,0,0);
         if (exp < today) {
            matchesExpiration = false;
         }
      }

      return matchesCategory && matchesSearch && matchesOrganic && matchesPrice && matchesExpiration;
    });
  }, [products, selectedCategory, searchQuery, organicOnly, priceRange, showExpired]);

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const clearAllFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setOrganicOnly(false);
    setShowExpired(false);
    setPriceRange({ min: '', max: '' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-stone-800">{t.appTitle}</h2>
          <p className="text-stone-500 mt-1">{t.buyDesc}</p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-grow md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all shadow-sm"
            />
          </div>
          
          <div className="relative group">
            <button className="relative bg-white p-2.5 rounded-xl border border-stone-200 text-stone-600 hover:text-green-700 hover:border-green-500 transition-all shadow-sm">
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                  {cartCount}
                </span>
              )}
            </button>
            {/* Cart Popover */}
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-stone-100 p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
               <h4 className="font-bold text-stone-800 border-b pb-2 mb-2">{t.cart}</h4>
               {cart.length === 0 ? (
                 <p className="text-stone-400 text-sm text-center py-4">{t.cartEmpty}</p>
               ) : (
                 <>
                   <div className="max-h-60 overflow-y-auto space-y-3 mb-3 pr-1">
                     {cart.map(item => (
                       <div key={item.id} className="flex justify-between items-center text-sm">
                         <div className="flex-1">
                            <span className="text-stone-700 font-medium block truncate pr-2">{item.name}</span>
                            <span className="text-stone-500 text-xs">${item.price.toFixed(2)} / {item.unit}</span>
                         </div>
                         <div className="flex items-center gap-2">
                           <div className="flex items-center border rounded-md bg-stone-50">
                              <button onClick={() => updateCartQuantity(item.id, -1)} className="p-1 hover:bg-stone-200 transition-colors"><Minus size={12}/></button>
                              <span className="w-6 text-center text-xs font-semibold">{item.quantity}</span>
                              <button onClick={() => updateCartQuantity(item.id, 1)} className="p-1 hover:bg-stone-200 transition-colors"><Plus size={12}/></button>
                           </div>
                           <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 transition-colors"><Trash2 size={16}/></button>
                         </div>
                       </div>
                     ))}
                   </div>
                   <div className="flex justify-between items-center font-bold text-green-700 pt-3 border-t">
                     <span>{t.total}</span>
                     <span>${cartTotal.toFixed(2)}</span>
                   </div>
                   <button 
                     onClick={onCheckout}
                     className="w-full mt-3 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 shadow-md"
                   >
                     {t.checkout}
                   </button>
                 </>
               )}
            </div>
          </div>
        </div>
      </div>

      {/* Categories & Filter Toggle */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all ${showFilters ? 'bg-green-100 border-green-500 text-green-800' : 'bg-white border-stone-200 text-stone-600 hover:border-stone-400'}`}
        >
           {showFilters ? <X size={16} /> : <SlidersHorizontal size={16} />} 
           {t.filters}
        </button>

        <div className="flex-1 overflow-x-auto pb-1 scrollbar-hide flex gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-green-600 text-white shadow-md shadow-green-600/20 border border-transparent'
                  : 'bg-white text-stone-600 border border-stone-200 hover:border-green-400 hover:text-green-700'
              }`}
            >
              {t.categories[cat as keyof typeof t.categories] || cat}
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="bg-stone-50 border border-stone-100 rounded-xl p-4 mb-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-2">
          
          {/* Organic Toggle */}
          <div className="space-y-3">
             <label className="flex items-center gap-3 cursor-pointer group">
               <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${organicOnly ? 'bg-green-600 border-green-600' : 'bg-white border-stone-300 group-hover:border-green-500'}`}>
                 {organicOnly && <Filter size={12} className="text-white" />}
               </div>
               <input type="checkbox" className="hidden" checked={organicOnly} onChange={(e) => setOrganicOnly(e.target.checked)} />
               <span className="text-stone-700 font-medium">{t.organicOnly}</span>
             </label>

             <label className="flex items-center gap-3 cursor-pointer group">
               <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${showExpired ? 'bg-amber-500 border-amber-500' : 'bg-white border-stone-300 group-hover:border-amber-400'}`}>
                 {showExpired && <AlertTriangle size={12} className="text-white" />}
               </div>
               <input type="checkbox" className="hidden" checked={showExpired} onChange={(e) => setShowExpired(e.target.checked)} />
               <span className="text-stone-700 font-medium">{t.showExpired}</span>
             </label>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase mb-2">{t.priceRange}</label>
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                placeholder={t.minPrice} 
                value={priceRange.min} 
                onChange={e => setPriceRange({...priceRange, min: e.target.value})}
                className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-sm focus:ring-1 focus:ring-green-500 outline-none"
              />
              <span className="text-stone-400">-</span>
              <input 
                type="number" 
                placeholder={t.maxPrice} 
                value={priceRange.max} 
                onChange={e => setPriceRange({...priceRange, max: e.target.value})}
                className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-sm focus:ring-1 focus:ring-green-500 outline-none"
              />
            </div>
          </div>
          
          {/* Reset Button */}
          <div className="flex items-end justify-end">
            <button 
              onClick={clearAllFilters}
              className="text-sm text-stone-500 hover:text-red-500 hover:underline transition-colors flex items-center gap-1"
            >
              <Trash2 size={14} /> {t.clearFilters}
            </button>
          </div>
        </div>
      )}

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.length === 0 ? (
           <div className="col-span-full py-20 text-center">
             <div className="inline-block p-4 rounded-full bg-stone-100 mb-4">
               <Search size={32} className="text-stone-400" />
             </div>
             <p className="text-stone-500 font-medium">{t.noResults}</p>
             <button 
               onClick={clearAllFilters}
               className="mt-4 text-green-600 hover:underline font-medium"
             >
               {t.clearFilters}
             </button>
           </div>
        ) : (
          filteredProducts.map(p => (
            <ProductCard 
              key={p.id} 
              product={p} 
              onAddToCart={addToCart} 
              lang={lang} 
              onViewProduct={onViewProduct}
              onViewProducer={onViewProducer}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Marketplace;
