import React, { useState, useRef } from 'react';
import { Product, Order } from '../types';
import { Plus, Wand2, Loader2, MapPin, X, Calendar, Upload, TrendingUp, ShoppingBag, Package, Star, Clock, AlertTriangle } from 'lucide-react';
import ProductCard from './ProductCard';
import { enhanceProductDescription } from '../services/geminiService';
import { translations, Language } from '../utils/translations';

interface ProducerDashboardProps {
  products: Product[];
  orders: Order[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  lang: Language;
}

const ProducerDashboard: React.FC<ProducerDashboardProps> = ({ products, orders, onAddProduct, onUpdateProduct, onDeleteProduct, lang }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = translations[lang];

  // Calculate Analytics
  const totalSales = orders.reduce((acc, order) => acc + order.total, 0);
  const totalItemsSold = orders.reduce((acc, order) => acc + order.items.reduce((sum, item) => sum + item.quantity, 0), 0);
  
  // Sort orders by date descending and take top 5
  const recentOrders = [...orders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  // Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('kg');
  const [category, setCategory] = useState('Vegetables');
  const [location, setLocation] = useState('My Farm');
  const [description, setDescription] = useState('');
  const [organic, setOrganic] = useState(false);
  const [harvestDate, setHarvestDate] = useState(new Date().toISOString().split('T')[0]);
  // Default expiration approx 7 days from now
  const defaultExpiration = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [expirationDate, setExpirationDate] = useState(defaultExpiration);
  const [maxQuantity, setMaxQuantity] = useState('100');
  const [imageUrl, setImageUrl] = useState('');

  const resetForm = () => {
    setName('');
    setPrice('');
    setUnit('kg');
    setCategory('Vegetables');
    setLocation('My Farm');
    setDescription('');
    setOrganic(false);
    setHarvestDate(new Date().toISOString().split('T')[0]);
    setExpirationDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setMaxQuantity('100');
    setImageUrl('');
    setEditingId(null);
  };

  const handleOpenForm = (product?: Product) => {
    if (product) {
      setEditingId(product.id);
      setName(product.name);
      setPrice(product.price.toString());
      setUnit(product.unit);
      setCategory(product.category);
      setLocation(product.location);
      setDescription(product.description);
      setOrganic(product.organic);
      setHarvestDate(product.harvestDate);
      setExpirationDate(product.expirationDate || '');
      setMaxQuantity(product.maxQuantity.toString());
      setImageUrl(product.imageUrl);
    } else {
      resetForm();
      // Random default image if new
      setImageUrl(`https://picsum.photos/seed/${Date.now()}/400/300`);
    }
    setIsFormOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEnhanceDescription = async () => {
    if (!name || !description) return;
    setIsEnhancing(true);
    const enhanced = await enhanceProductDescription(name, category, description);
    setDescription(enhanced);
    setIsEnhancing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const productData: Product = {
      id: editingId || Date.now().toString(),
      name,
      price: parseFloat(price),
      unit,
      category,
      location,
      description,
      sellerName: 'You (Producer)',
      imageUrl: imageUrl || `https://picsum.photos/seed/${Date.now()}/400/300`,
      organic,
      harvestDate,
      expirationDate,
      maxQuantity: parseInt(maxQuantity) || 0,
      rating: 0, // Default for new
      reviewCount: 0
    };

    if (editingId) {
      // Preserve existing rating if editing
      const existing = products.find(p => p.id === editingId);
      if (existing) {
          productData.rating = existing.rating;
          productData.reviewCount = existing.reviewCount;
      }
      onUpdateProduct(productData);
    } else {
      onAddProduct(productData);
    }
    setIsFormOpen(false);
    resetForm();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      
      {/* Analytics Section */}
      <div className="mb-10">
        <h2 className="text-xl font-bold text-stone-800 mb-4">{t.analytics}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm text-stone-500">{t.totalSales}</p>
              <p className="text-2xl font-bold text-stone-800">${totalSales.toFixed(2)}</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <ShoppingBag size={24} />
            </div>
            <div>
              <p className="text-sm text-stone-500">{t.totalOrders}</p>
              <p className="text-2xl font-bold text-stone-800">{orders.length}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
              <Package size={24} />
            </div>
            <div>
              <p className="text-sm text-stone-500">{t.itemsSold}</p>
              <p className="text-2xl font-bold text-stone-800">{totalItemsSold}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="mb-10">
        <h2 className="text-xl font-bold text-stone-800 mb-4">{t.recentOrders}</h2>
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
          {recentOrders.length === 0 ? (
             <div className="p-8 text-center text-stone-400">
               <Clock size={32} className="mx-auto mb-2 opacity-50"/>
               <p>{t.noOrders}</p>
             </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-stone-50 border-b border-stone-100">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-stone-600">{t.orderId}</th>
                    <th className="px-6 py-4 font-semibold text-stone-600">{t.customer}</th>
                    <th className="px-6 py-4 font-semibold text-stone-600">{t.date}</th>
                    <th className="px-6 py-4 font-semibold text-stone-600">{t.amount}</th>
                    <th className="px-6 py-4 font-semibold text-stone-600">{t.status}</th>
                    <th className="px-6 py-4 font-semibold text-stone-600">{t.rating}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {recentOrders.map(order => (
                    <tr key={order.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-stone-500">#{order.id.slice(-6)}</td>
                      <td className="px-6 py-4 text-stone-800 font-medium">{order.customerName}</td>
                      <td className="px-6 py-4 text-stone-500">{new Date(order.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-stone-800 font-bold">${order.total.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {order.rating ? (
                          <div className="flex items-center gap-1 text-amber-400">
                            <Star size={14} fill="currentColor" />
                            <span className="text-stone-700 font-semibold">{order.rating}</span>
                          </div>
                        ) : (
                          <span className="text-stone-300">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center mb-8">
        <div>
           <h2 className="text-3xl font-bold text-stone-800">{t.myFarmStand}</h2>
           <p className="text-stone-500 mt-1">{t.manageListings}</p>
        </div>
        <button
          onClick={() => handleOpenForm()}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-green-600/20 flex items-center gap-2 transition-all"
        >
          <Plus size={20} /> {t.addProduct}
        </button>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.length === 0 ? (
           <div className="col-span-full py-20 text-center text-stone-400 bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200">
             <p>No products listed yet. Click "{t.addProduct}" to start selling!</p>
           </div>
        ) : (
          products.map(p => (
            <ProductCard 
              key={p.id} 
              product={p} 
              isProducerView={true} 
              lang={lang} 
              onEdit={handleOpenForm}
              onDelete={onDeleteProduct}
            />
          ))
        )}
      </div>

      {/* Add/Edit Product Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-stone-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-stone-800">{editingId ? t.editProduct : t.addProduct}</h3>
              <button onClick={() => setIsFormOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              {/* Image Upload */}
              <div className="flex flex-col items-center justify-center">
                 <div className="relative w-full h-48 bg-stone-100 rounded-lg overflow-hidden border-2 border-dashed border-stone-300 hover:border-green-500 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    {imageUrl ? (
                      <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-stone-400">
                        <Upload size={32} className="mb-2" />
                        <span className="text-sm">{t.uploadImage}</span>
                      </div>
                    )}
                 </div>
                 <input 
                   type="file" 
                   ref={fileInputRef} 
                   onChange={handleImageUpload} 
                   accept="image/*" 
                   className="hidden" 
                 />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                  placeholder="e.g. Heirloom Tomatoes"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-green-500 outline-none"
                  >
                    <option>Vegetables</option>
                    <option>Fruits</option>
                    <option>Dairy & Eggs</option>
                    <option>Honey & Jams</option>
                    <option>Herbs</option>
                    <option>Oil & Olives</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Unit</label>
                  <select
                    value={unit}
                    onChange={e => setUnit(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-green-500 outline-none"
                  >
                    <option value="kg">per kg</option>
                    <option value="lb">per lb</option>
                    <option value="bunch">per bunch</option>
                    <option value="piece">per piece</option>
                    <option value="dozen">per dozen</option>
                    <option value="jar">per jar</option>
                    <option value="liter">per liter</option>
                  </select>
                </div>
              </div>

               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Harvest Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 text-stone-400" size={16} />
                      <input
                          type="date"
                          value={harvestDate}
                          onChange={e => setHarvestDate(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-green-500 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">{t.expirationDate}</label>
                    <div className="relative">
                      <AlertTriangle className="absolute left-3 top-2.5 text-stone-400" size={16} />
                      <input
                          type="date"
                          value={expirationDate}
                          onChange={e => setExpirationDate(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-green-500 outline-none"
                      />
                    </div>
                  </div>
               </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-green-500 outline-none"
                    placeholder="0.00"
                  />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">{t.maxQuantity}</label>
                    <input
                      type="number"
                      value={maxQuantity}
                      onChange={e => setMaxQuantity(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-green-500 outline-none"
                    />
                  </div>
              </div>

              <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 text-stone-400" size={16} />
                    <input
                        type="text"
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-green-500 outline-none"
                        placeholder="Farm location"
                    />
                  </div>
                </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
                <div className="relative">
                  <textarea
                    required
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-green-500 outline-none resize-none"
                    placeholder="Describe your produce..."
                  />
                  <button
                    type="button"
                    onClick={handleEnhanceDescription}
                    disabled={isEnhancing || !name || !description}
                    className="absolute right-2 bottom-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-colors disabled:opacity-50"
                  >
                    {isEnhancing ? <Loader2 size={12} className="animate-spin"/> : <Wand2 size={12} />}
                    AI Enhance
                  </button>
                </div>
                <p className="text-xs text-stone-400 mt-1">Tip: Use the AI button to make your description catchier!</p>
              </div>

              <div className="flex items-center gap-2">
                 <input
                    type="checkbox"
                    id="organic"
                    checked={organic}
                    onChange={e => setOrganic(e.target.checked)}
                    className="w-4 h-4 text-green-600 border-stone-300 rounded focus:ring-green-500"
                 />
                 <label htmlFor="organic" className="text-sm text-stone-700 select-none">This product is Organic Certified</label>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-all shadow-md active:scale-[0.98]"
                >
                  {editingId ? t.saveChanges : 'List Item For Sale'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProducerDashboard;