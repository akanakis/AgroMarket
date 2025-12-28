import React, { useState, useEffect } from 'react';
import { UserRole, Product, CartItem, UserProfile, Order, AppView } from './types';
import { Sprout, Store, ArrowLeftRight, UserCircle, Globe, Package } from 'lucide-react';
import Marketplace from './components/Marketplace';
import ProducerDashboard from './components/ProducerDashboard';
import Registration from './components/Registration';
import Toast from './components/Toast';
import CheckoutModal from './components/CheckoutModal';
import OrdersModal from './components/OrdersModal';
import ProductDetails from './components/ProductDetails';
import ProducerProfile from './components/ProducerProfile';
import { translations, Language } from './utils/translations';
import * as API from './services/apiService';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('LANDING');
  const [role, setRole] = useState<UserRole | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [lang, setLang] = useState<Language>('en');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isBuyerOrdersOpen, setIsBuyerOrdersOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Navigation State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedProducer, setSelectedProducer] = useState<string | null>(null);
  
  // Current user ID (stored in localStorage for demo)
  const [currentUserId, setCurrentUserId] = useState<number | null>(() => {
    const stored = localStorage.getItem('agromarket_user_id');
    return stored ? parseInt(stored) : null;
  });

  const t = translations[lang];

  // Load products on mount
  useEffect(() => {
    loadProducts();
    loadOrders();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await API.fetchProducts();
      // Convert API format to frontend format
      const convertedProducts: Product[] = data.map(p => ({
        id: p.id.toString(),
        name: p.name,
        description: p.description,
        price: p.price,
        unit: p.unit,
        category: p.category,
        location: p.location,
        sellerName: p.seller_name,
        imageUrl: p.image_url,
        organic: p.organic,
        harvestDate: p.harvest_date,
        expirationDate: p.expiration_date || undefined,
        maxQuantity: p.max_quantity,
        rating: p.rating,
        reviewCount: p.review_count
      }));
      setProducts(convertedProducts);
    } catch (error) {
      console.error('Error loading products:', error);
      setToastMessage('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      const data = await API.fetchOrders();
      // Convert API format to frontend format
      const convertedOrders: Order[] = data.map(o => ({
        id: o.id.toString(),
        items: [], // You'll need to fetch order items separately or include in response
        total: o.total,
        date: o.created_at,
        customerName: o.customer_name,
        status: o.status as 'Pending' | 'Completed',
        rating: o.rating || undefined
      }));
      setOrders(convertedOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  // Add a product to the database
  const handleAddProduct = async (newProduct: Product) => {
    if (!currentUserId) {
      setToastMessage('Please log in to add products');
      return;
    }

    try {
      const productData = {
        name: newProduct.name,
        description: newProduct.description,
        price: newProduct.price,
        unit: newProduct.unit,
        category: newProduct.category,
        location: newProduct.location,
        seller_id: currentUserId,
        seller_name: newProduct.sellerName,
        image_url: newProduct.imageUrl,
        organic: newProduct.organic,
        harvest_date: newProduct.harvestDate,
        expiration_date: newProduct.expirationDate,
        max_quantity: newProduct.maxQuantity
      };

      await API.createProduct(productData);
      await loadProducts(); // Reload products from server
      setToastMessage('Product listed successfully!');
    } catch (error) {
      console.error('Error adding product:', error);
      setToastMessage('Failed to add product');
    }
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    try {
      const productData = {
        name: updatedProduct.name,
        description: updatedProduct.description,
        price: updatedProduct.price,
        unit: updatedProduct.unit,
        category: updatedProduct.category,
        location: updatedProduct.location,
        image_url: updatedProduct.imageUrl,
        organic: updatedProduct.organic,
        harvest_date: updatedProduct.harvestDate,
        expiration_date: updatedProduct.expirationDate,
        max_quantity: updatedProduct.maxQuantity
      };

      await API.updateProduct(parseInt(updatedProduct.id), productData);
      await loadProducts();
      setToastMessage('Product updated successfully!');
    } catch (error) {
      console.error('Error updating product:', error);
      setToastMessage('Failed to update product');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        await API.deleteProduct(parseInt(id));
        await loadProducts();
        setToastMessage('Product deleted successfully!');
      } catch (error) {
        console.error('Error deleting product:', error);
        setToastMessage('Failed to delete product');
      }
    }
  };

  // Add to cart logic (unchanged - local state)
  const handleAddToCart = (product: Product, quantity: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
    setToastMessage(`${quantity}x ${product.name} ${t.addedToCart}`);
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const handleUpdateCartQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    if (selectedRole === UserRole.BUYER) {
      // Direct access for buyers (Guest mode)
      setUserProfile({ name: t.guest, role: UserRole.BUYER, location: 'Greece' });
      setView('APP');
    } else {
      setView('REGISTER');
    }
  };

  const handleRegistrationComplete = async (profile: UserProfile) => {
    try {
      // Create user in database
      const userData = {
        name: profile.name,
        role: profile.role,
        location: profile.location,
        farm_name: profile.farmName,
        certifications: profile.certifications ? JSON.stringify(profile.certifications) : undefined,
        preferences: profile.preferences ? JSON.stringify(profile.preferences) : undefined
      };

      const createdUser = await API.createUser(userData);
      setCurrentUserId(createdUser.id);
      localStorage.setItem('agromarket_user_id', createdUser.id.toString());
      
      setUserProfile(profile);
      setView('APP');
    } catch (error) {
      console.error('Error creating user:', error);
      setToastMessage('Failed to create user account');
    }
  };

  const switchRole = () => {
    setRole(null);
    setUserProfile(null);
    setView('LANDING');
    setSelectedProduct(null);
    setSelectedProducer(null);
  };

  const handlePlaceOrder = async () => {
    try {
      const orderData = {
        customer_name: userProfile?.name || 'Guest',
        total: cart.reduce((acc, item) => acc + (item.price * item.quantity), 0),
        status: 'Pending',
        customer_id: currentUserId || undefined,
        items: cart.map(item => ({
          product_id: parseInt(item.id),
          quantity: item.quantity,
          price: item.price
        }))
      };

      await API.createOrder(orderData);
      await loadOrders();
      setCart([]);
      setIsCheckoutOpen(false);
      setToastMessage(t.orderSuccess);
    } catch (error) {
      console.error('Error placing order:', error);
      setToastMessage('Failed to place order');
    }
  };

  const handleRateOrder = async (orderId: string, rating: number) => {
    try {
      await API.rateOrder(parseInt(orderId), rating);
      await loadOrders();
      await loadProducts(); // Reload to get updated product ratings
      setToastMessage('Thank you for your rating!');
    } catch (error) {
      console.error('Error rating order:', error);
      setToastMessage('Failed to submit rating');
    }
  };

  const toggleLanguage = () => {
    const langs: Language[] = ['en', 'el', 'de', 'fr'];
    const currentIndex = langs.indexOf(lang);
    setLang(langs[(currentIndex + 1) % langs.length]);
  };

  // Navigation Handlers
  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setView('PRODUCT_DETAILS');
    window.scrollTo(0, 0);
  };

  const handleViewProducer = (sellerName: string) => {
    setSelectedProducer(sellerName);
    setView('PRODUCER_PROFILE');
    window.scrollTo(0, 0);
  };

  const handleBackToMarket = () => {
    setSelectedProduct(null);
    setSelectedProducer(null);
    setView('APP');
  };

  // Landing Screen
  if (view === 'LANDING') {
    return (
      <div className="min-h-screen bg-[#fcfdfa] flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-4 right-4 z-50">
           <button onClick={toggleLanguage} className="flex items-center gap-1 text-sm font-semibold text-stone-600 bg-white/50 px-3 py-1 rounded-full hover:bg-white border border-transparent hover:border-stone-200 transition-all">
             <Globe size={16} /> {lang.toUpperCase()}
           </button>
        </div>
        <div className="absolute top-0 left-0 w-full h-1/2 bg-green-50/50 -skew-y-3 transform origin-top-left -z-10"></div>
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 p-4 rounded-full shadow-lg shadow-green-100">
              <Sprout size={48} className="text-green-600" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-stone-800 mb-4 tracking-tight">{t.appTitle}</h1>
          <p className="text-xl text-stone-500 leading-relaxed">
            {t.tagline}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 w-full max-w-3xl">
          <button 
            onClick={() => handleRoleSelect(UserRole.BUYER)}
            className="group relative bg-white border-2 border-green-100 hover:border-green-500 p-8 rounded-3xl text-left transition-all hover:shadow-xl hover:-translate-y-1"
          >
            <div className="bg-green-50 w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-600 transition-colors">
              <Store className="text-green-600 group-hover:text-white" size={24} />
            </div>
            <h3 className="text-2xl font-bold text-stone-800 mb-2">{t.buyBtn}</h3>
            <p className="text-stone-500">{t.buyDesc}</p>
          </button>

          <button 
            onClick={() => handleRoleSelect(UserRole.PRODUCER)}
            className="group relative bg-white border-2 border-amber-100 hover:border-amber-500 p-8 rounded-3xl text-left transition-all hover:shadow-xl hover:-translate-y-1"
          >
            <div className="bg-amber-50 w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:bg-amber-500 transition-colors">
              <Sprout className="text-amber-600 group-hover:text-white" size={24} />
            </div>
            <h3 className="text-2xl font-bold text-stone-800 mb-2">{t.sellBtn}</h3>
            <p className="text-stone-500">{t.sellDesc}</p>
          </button>
        </div>
      </div>
    );
  }

  if (view === 'REGISTER' && role) {
    return (
      <Registration 
        role={role} 
        onComplete={handleRegistrationComplete}
        onBack={() => setView('LANDING')}
      />
    );
  }

  // Main App Shell
  return (
    <div className="min-h-screen bg-[#fcfdfa] flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
           <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setView('LANDING'); }}>
             <Sprout className="text-green-600" size={24} />
             <span className="font-bold text-xl text-stone-800 tracking-tight">{t.appTitle}</span>
           </div>

           <div className="flex items-center gap-4">
             <button onClick={toggleLanguage} className="flex items-center gap-1 text-sm font-semibold text-stone-600 bg-stone-50 px-3 py-1.5 rounded-full hover:bg-stone-100 transition-all">
               <Globe size={16} /> {lang.toUpperCase()}
             </button>

             {role === UserRole.BUYER && (
                <button 
                  onClick={() => setIsBuyerOrdersOpen(true)}
                  className="flex items-center gap-2 text-sm text-stone-600 hover:text-green-700 bg-white hover:bg-green-50 px-3 py-1.5 rounded-full border border-stone-200 transition-all"
                >
                  <Package size={16} />
                  <span className="hidden sm:inline">{t.myOrders}</span>
                </button>
             )}

             {userProfile && (
                <div className="hidden md:flex items-center gap-2 text-sm text-stone-600 bg-stone-50 px-3 py-1.5 rounded-full border border-stone-200">
                  <UserCircle size={16} />
                  <span>{t.viewingAs}: <span className="font-semibold text-stone-800">{userProfile.name}</span></span>
                </div>
             )}
             
             <button 
               onClick={switchRole}
               className="flex items-center gap-2 text-sm font-medium text-green-700 hover:bg-green-50 px-3 py-2 rounded-lg transition-colors"
             >
               <ArrowLeftRight size={16} />
               <span className="hidden sm:inline">{t.switchRole}</span>
             </button>
           </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-grow">
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-stone-400">Loading...</div>
          </div>
        ) : view === 'PRODUCT_DETAILS' && selectedProduct ? (
          <ProductDetails 
            product={selectedProduct}
            onBack={handleBackToMarket}
            onAddToCart={handleAddToCart}
            onViewProducer={handleViewProducer}
            lang={lang}
          />
        ) : view === 'PRODUCER_PROFILE' && selectedProducer ? (
          <ProducerProfile 
            sellerName={selectedProducer}
            allProducts={products}
            onBack={handleBackToMarket}
            onAddToCart={handleAddToCart}
            onViewProduct={handleViewProduct}
            lang={lang}
          />
        ) : role === UserRole.BUYER ? (
          <Marketplace 
            products={products} 
            addToCart={handleAddToCart} 
            cart={cart}
            removeFromCart={handleRemoveFromCart}
            updateCartQuantity={handleUpdateCartQuantity}
            lang={lang} 
            onCheckout={() => setIsCheckoutOpen(true)}
            onViewProduct={handleViewProduct}
            onViewProducer={handleViewProducer}
          />
        ) : (
          <ProducerDashboard 
            products={products.filter(p => currentUserId && p.sellerName === userProfile?.name)} 
            orders={orders}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            lang={lang}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-100 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-stone-400 text-sm">
          <p>&copy; {new Date().getFullYear()} {t.appTitle}. Supporting local agriculture.</p>
        </div>
      </footer>

      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
      
      <CheckoutModal 
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onPlaceOrder={handlePlaceOrder}
        cartTotal={cart.reduce((acc, item) => acc + (item.price * item.quantity), 0)}
        items={cart}
        lang={lang}
      />
      
      <OrdersModal 
        isOpen={isBuyerOrdersOpen}
        onClose={() => setIsBuyerOrdersOpen(false)}
        orders={orders.filter(o => o.customerName === (userProfile?.name || 'Guest'))}
        onRateOrder={handleRateOrder}
        lang={lang}
      />
    </div>
  );
};

export default App;