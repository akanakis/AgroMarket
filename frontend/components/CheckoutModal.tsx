import React, { useState } from 'react';
import { X, CreditCard, Truck, Loader2, CheckCircle, MapPin, Phone, User } from 'lucide-react';
import { CartItem } from '../types';
import { translations, Language } from '../utils/translations';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlaceOrder: () => void;
  cartTotal: number;
  items: CartItem[];
  lang: Language;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onPlaceOrder, cartTotal, items, lang }) => {
  const t = translations[lang];
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card'>('cod');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    // onPlaceOrder handles the delay logic now in App.tsx, but if it didn't we'd do it here. 
    // Since we put the delay in App.tsx, we rely on the prop function. 
    // However, to show the loader immediately:
    onPlaceOrder(); 
    // We don't turn off processing here because the modal will likely close or unmount when order is placed.
    // If we wanted to keep modal open, we'd need a success state inside the modal.
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-stone-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <h3 className="text-xl font-bold text-stone-800 flex items-center gap-2">
            <CheckCircle className="text-green-600" size={24}/>
            {t.checkoutTitle}
          </h3>
          <button onClick={onClose} disabled={isProcessing} className="text-stone-400 hover:text-stone-600 disabled:opacity-50">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-stone-50 p-4 rounded-xl mb-6 border border-stone-100">
            <h4 className="font-semibold text-stone-700 mb-2 text-sm uppercase tracking-wide">{t.cart}</h4>
            <div className="space-y-3 mb-3 max-h-40 overflow-y-auto pr-1">
              {items.map(item => (
                <div key={item.id} className="flex justify-between items-center text-sm text-stone-600 bg-white p-2 rounded-lg shadow-sm border border-stone-100">
                  <span className="font-medium">{item.quantity}x {item.name}</span>
                  <span className="font-mono">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center font-bold text-green-700 pt-3 border-t border-stone-200 text-lg">
              <span>{t.total}</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h4 className="font-semibold text-stone-700 mb-3 flex items-center gap-2">
                <MapPin size={18} className="text-amber-500" />
                {t.shippingDetails}
              </h4>
              <div className="space-y-3">
                <div className="relative">
                   <User className="absolute left-3 top-3 text-stone-400" size={16}/>
                   <input required type="text" placeholder={t.fullName} className="w-full pl-9 pr-3 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm transition-all" />
                </div>
                <div className="relative">
                   <MapPin className="absolute left-3 top-3 text-stone-400" size={16}/>
                   <input required type="text" placeholder={t.address} className="w-full pl-9 pr-3 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm transition-all" />
                </div>
                <div className="relative">
                   <Phone className="absolute left-3 top-3 text-stone-400" size={16}/>
                   <input required type="tel" placeholder={t.phone} className="w-full pl-9 pr-3 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm transition-all" />
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-stone-700 mb-3 flex items-center gap-2">
                <CreditCard size={18} className="text-amber-500" />
                {t.paymentMethod}
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <label className={`cursor-pointer p-3 border rounded-xl flex flex-col items-center gap-2 text-sm transition-all shadow-sm ${paymentMethod === 'cod' ? 'border-green-500 bg-green-50 text-green-700 ring-1 ring-green-500' : 'border-stone-200 text-stone-600 hover:border-green-300'}`}>
                  <input type="radio" name="payment" className="hidden" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                  <Truck size={24} className="mb-1" />
                  <span className="font-bold">{t.cod}</span>
                </label>
                <label className={`cursor-pointer p-3 border rounded-xl flex flex-col items-center gap-2 text-sm transition-all shadow-sm ${paymentMethod === 'card' ? 'border-green-500 bg-green-50 text-green-700 ring-1 ring-green-500' : 'border-stone-200 text-stone-600 hover:border-green-300'}`}>
                  <input type="radio" name="payment" className="hidden" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} />
                  <CreditCard size={24} className="mb-1" />
                  <span className="font-bold">{t.card}</span>
                </label>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isProcessing}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-stone-400 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-green-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 size={24} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {t.placeOrder} - ${cartTotal.toFixed(2)}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;