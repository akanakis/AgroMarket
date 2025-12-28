import React, { useState } from 'react';
import { X, Star, Calendar, Package } from 'lucide-react';
import { Order } from '../types';
import { translations, Language } from '../utils/translations';

interface OrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onRateOrder: (orderId: string, rating: number) => void;
  lang: Language;
}

const OrdersModal: React.FC<OrdersModalProps> = ({ isOpen, onClose, orders, onRateOrder, lang }) => {
  const t = translations[lang];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="p-6 border-b border-stone-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <h3 className="text-xl font-bold text-stone-800">{t.myOrders}</h3>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-10 text-stone-400">
               <Package size={48} className="mx-auto mb-3 opacity-20" />
               <p>{t.noOrders}</p>
            </div>
          ) : (
            orders.map(order => (
              <div key={order.id} className="bg-white border border-stone-200 rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm font-bold text-stone-500">#{order.id.slice(-6)}</span>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${order.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-stone-500">
                       <Calendar size={12} /> {new Date(order.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block font-bold text-lg text-stone-800">${order.total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="bg-stone-50 rounded-lg p-3 mb-4 text-sm text-stone-600">
                  {order.items.map(item => (
                    <div key={item.id} className="flex justify-between py-1 border-b border-stone-100 last:border-0">
                       <span>{item.quantity}x {item.name}</span>
                       <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end items-center gap-3">
                   {order.rating ? (
                     <div className="flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
                       <span className="text-xs font-bold text-amber-800">{t.rating}:</span>
                       <div className="flex">
                         {[1, 2, 3, 4, 5].map(star => (
                           <Star key={star} size={14} className={star <= order.rating! ? "fill-amber-400 text-amber-400" : "text-stone-300"} />
                         ))}
                       </div>
                     </div>
                   ) : (
                     <div className="flex items-center gap-2">
                       <span className="text-sm font-medium text-stone-600">{t.rateOrder}:</span>
                       <div className="flex gap-1">
                         {[1, 2, 3, 4, 5].map(star => (
                           <button 
                             key={star}
                             onClick={() => onRateOrder(order.id, star)}
                             className="hover:scale-110 transition-transform text-stone-300 hover:text-amber-400"
                           >
                             <Star size={20} fill="currentColor" />
                           </button>
                         ))}
                       </div>
                     </div>
                   )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default OrdersModal;
