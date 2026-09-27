import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  CartItem,
  Retailer,
  TransportMethod,
  UserPreferences,
  BudgetHistoryItem,
} from '../types';
import { INITIAL_PRODUCTS, STORES, DELIVERY_FEE, taxiFareForDistance } from '../data/mockProducts';

interface AppContextType {
  // User state
  user: { email: string; name: string } | null;
  login: (email: string) => void;
  logout: () => void;

  // Products & catalogue
  products: Product[];
  favourites: Set<number>;
  dislikes: Set<number>;
  toggleFavourite: (productId: number) => void;
  dislikeProduct: (productId: number) => void;
  undislikeProduct: (productId: number) => void;

  // Cart & Budget
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  budget: number;
  setBudget: (budget: number) => void;

  // Transport methods per store
  transportMethods: Record<Retailer, TransportMethod>;
  setTransportMethod: (store: Retailer, method: TransportMethod) => void;

  // Cost calculations
  getStoreSubtotal: (store: Retailer) => number;
  getStoreTransportCost: (store: Retailer) => number;
  getTotalStoreCost: (store: Retailer) => number;
  getTotalTrueCost: () => number;

  // Preferences
  preferences: UserPreferences;
  updatePreferences: (newPrefs: Partial<UserPreferences>) => void;

  // History
  history: BudgetHistoryItem[];
  addHistoryItem: (item: Omit<BudgetHistoryItem, 'id' | 'dateExported'>) => void;

  // Navigation & UI state
  activeTab: 'catalogue' | 'favourites' | 'preferences' | 'history';
  setActiveTab: (tab: 'catalogue' | 'favourites' | 'preferences' | 'history') => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isNavOpen: boolean;
  setIsNavOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isDistanceModalOpen: boolean;
  setIsDistanceModalOpen: (open: boolean) => void;

  // Toast
  toast: { message: string; type?: 'default' | 'warn' | 'over' | 'success' } | null;
  showToast: (message: string, type?: 'default' | 'warn' | 'over' | 'success') => void;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  address: '14 Musgrave Road, Berea, Durban, 4001',
  shoppingFrequency: 'Weekly',
  dietaryNeeds: [],
  allergies: [],
  productStyle: 'Value & Balance',
  cookingStyle: 'Quick & 30-min',
  lifestyle: 'Student / Solo',
  notifications: true,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // User state
  const [user, setUser] = useState<{ email: string; name: string } | null>(() => {
    const saved = localStorage.getItem('smartspend_user');
    return saved ? JSON.parse(saved) : { email: 'eddiemaps902@gmail.com', name: 'Eddie Maps' };
  });

  // Budget
  const [budget, setBudgetState] = useState<number>(() => {
    const saved = localStorage.getItem('smartspend_budget');
    return saved ? parseFloat(saved) : 450;
  });

  const setBudget = (b: number) => {
    setBudgetState(b);
    localStorage.setItem('smartspend_budget', b.toString());
  };

  // Products
  const [products] = useState<Product[]>(INITIAL_PRODUCTS);

  // Favourites
  const [favourites, setFavourites] = useState<Set<number>>(() => {
    const saved = localStorage.getItem('smartspend_favourites');
    return saved ? new Set(JSON.parse(saved)) : new Set([1, 6, 11, 21]);
  });

  // Dislikes / Hidden items
  const [dislikes, setDislikes] = useState<Set<number>>(() => {
    const saved = localStorage.getItem('smartspend_dislikes');
    return saved ? new Set(JSON.parse(saved)) : new Set([]);
  });

  // Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('smartspend_cart');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'i1', productId: 21, title: 'Clover Full Cream Fresh Milk 2L', price: 33.99, retailer: 'Checkers', category: 'Dairy,Eggs & Milk', quantity: 1, imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80' },
      { id: 'i2', productId: 17, title: 'Spekko Royal Royal Basmati Rice 1kg', price: 44.99, retailer: 'Checkers', category: 'Rice', quantity: 1, imageUrl: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=600&auto=format&fit=crop&q=80' },
      { id: 'i3', productId: 22, title: 'Large Free Range Eggs 18-Pack', price: 59.99, retailer: 'Pick n Pay', category: 'Dairy,Eggs & Milk', quantity: 1, imageUrl: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=600&auto=format&fit=crop&q=80' },
      { id: 'i4', productId: 3, title: 'Organic Hass Avocados 4-Pack', price: 49.99, retailer: 'Woolworths', category: 'Fruits', quantity: 1, imageUrl: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=600&auto=format&fit=crop&q=80' },
    ];
  });

  // Transport methods per retailer
  const [transportMethods, setTransportMethods] = useState<Record<Retailer, TransportMethod>>({
    'Checkers': 'delivery',
    'Pick n Pay': 'walk',
    'Woolworths': 'taxi',
    'Shoprite': 'walk',
    "Food Lover's": 'taxi',
  });

  // Preferences
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    const saved = localStorage.getItem('smartspend_preferences');
    return saved ? JSON.parse(saved) : DEFAULT_PREFERENCES;
  });

  // History
  const [history, setHistory] = useState<BudgetHistoryItem[]>(() => {
    const saved = localStorage.getItem('smartspend_history');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'hist-1',
        filename: 'SmartSpend-Shopping-List-20260920.pdf',
        dateExported: new Date(Date.now() - 7 * 86400000).toISOString(),
        totalCost: 382.50,
        budgetLimit: 400,
        itemCount: 5,
        stores: ['Checkers', 'Pick n Pay'],
        items: [],
        transportMethods: { 'Checkers': 'delivery', 'Pick n Pay': 'walk' },
      }
    ];
  });

  // UI States
  const [activeTab, setActiveTab] = useState<'catalogue' | 'favourites' | 'preferences' | 'history'>('catalogue');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDistanceModalOpen, setIsDistanceModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type?: 'default' | 'warn' | 'over' | 'success' } | null>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('smartspend_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('smartspend_favourites', JSON.stringify(Array.from(favourites)));
  }, [favourites]);

  useEffect(() => {
    localStorage.setItem('smartspend_dislikes', JSON.stringify(Array.from(dislikes)));
  }, [dislikes]);

  useEffect(() => {
    localStorage.setItem('smartspend_preferences', JSON.stringify(preferences));
  }, [preferences]);

  useEffect(() => {
    localStorage.setItem('smartspend_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    if (user) localStorage.setItem('smartspend_user', JSON.stringify(user));
    else localStorage.removeItem('smartspend_user');
  }, [user]);

  const showToast = (message: string, type: 'default' | 'warn' | 'over' | 'success' = 'default') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const login = (email: string) => {
    const namePart = email.split('@')[0];
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    setUser({ email, name: formattedName });
    showToast(`Welcome back, ${formattedName}!`, 'success');
  };

  const logout = () => {
    setUser(null);
    showToast('You have been logged out.');
  };

  const toggleFavourite = (productId: number) => {
    setFavourites(prev => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
        showToast('Removed from favourites');
      } else {
        next.add(productId);
        showToast('Saved to favourites', 'success');
      }
      return next;
    });
  };

  const dislikeProduct = (productId: number) => {
    setDislikes(prev => {
      const next = new Set(prev);
      next.add(productId);
      return next;
    });
    // also remove from favourites and cart if present
    setFavourites(prev => {
      const next = new Set(prev);
      next.delete(productId);
      return next;
    });
    setCart(prev => prev.filter(c => c.productId !== productId));
    showToast("Product hidden. It won't show in your catalogue again.");
  };

  const undislikeProduct = (productId: number) => {
    setDislikes(prev => {
      const next = new Set(prev);
      next.delete(productId);
      return next;
    });
    showToast('Product restored to catalogue.', 'success');
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item =>
          item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: `cart-${Date.now()}-${product.id}`,
          productId: product.id,
          title: product.title,
          price: product.price,
          retailer: product.retailer,
          category: product.category,
          quantity: 1,
          imageUrl: product.imageUrl,
        }
      ];
    });
    showToast(`Added ${product.title} to list`, 'success');
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(i => i.id !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart(prev =>
      prev.map(i => (i.id === cartItemId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => setCart([]);

  const setTransportMethod = (store: Retailer, method: TransportMethod) => {
    setTransportMethods(prev => ({ ...prev, [store]: method }));
  };

  // Calculations
  const getStoreSubtotal = (store: Retailer): number => {
    return cart
      .filter(item => item.retailer === store)
      .reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const getStoreTransportCost = (store: Retailer): number => {
    const hasItems = cart.some(item => item.retailer === store);
    if (!hasItems) return 0;
    const method = transportMethods[store] || 'walk';
    if (method === 'walk') return 0;
    if (method === 'delivery') return DELIVERY_FEE;
    if (method === 'taxi') {
      const km = STORES[store]?.distanceKm || 8;
      return taxiFareForDistance(km);
    }
    return 0;
  };

  const getTotalStoreCost = (store: Retailer): number => {
    return getStoreSubtotal(store) + getStoreTransportCost(store);
  };

  const getTotalTrueCost = (): number => {
    const storesInCart = Array.from(new Set(cart.map(i => i.retailer)));
    return storesInCart.reduce((acc, store) => acc + getTotalStoreCost(store), 0);
  };

  const updatePreferences = (newPrefs: Partial<UserPreferences>) => {
    setPreferences(prev => ({ ...prev, ...newPrefs }));
    showToast('Preferences updated successfully', 'success');
  };

  const addHistoryItem = (item: Omit<BudgetHistoryItem, 'id' | 'dateExported'>) => {
    const newItem: BudgetHistoryItem = {
      ...item,
      id: `hist-${Date.now()}`,
      dateExported: new Date().toISOString(),
    };
    setHistory(prev => [newItem, ...prev]);
  };

  // Budget threshold checks
  useEffect(() => {
    if (budget <= 0 || cart.length === 0) return;
    const spent = getTotalTrueCost();
    const ratio = spent / budget;
    if (ratio >= 1.0) {
      showToast("You've exceeded your grocery budget!", 'over');
    } else if (ratio >= 0.8) {
      showToast("You've reached 80% of your grocery budget.", 'warn');
    }
  }, [cart, transportMethods, budget]);

  return (
    <AppContext.Provider
      value={{
        user,
        login,
        logout,
        products,
        favourites,
        dislikes,
        toggleFavourite,
        dislikeProduct,
        undislikeProduct,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        budget,
        setBudget,
        transportMethods,
        setTransportMethod,
        getStoreSubtotal,
        getStoreTransportCost,
        getTotalStoreCost,
        getTotalTrueCost,
        preferences,
        updatePreferences,
        history,
        addHistoryItem,
        activeTab,
        setActiveTab,
        isCartOpen,
        setIsCartOpen,
        isNavOpen,
        setIsNavOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isDistanceModalOpen,
        setIsDistanceModalOpen,
        toast,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
