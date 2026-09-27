import React from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/Header';
import { NavigationDrawer } from './components/NavigationDrawer';
import { CartDrawer } from './components/CartDrawer';
import { CatalogueView } from './components/CatalogueView';
import { FavouritesView } from './components/FavouritesView';
import { HistoryView } from './components/HistoryView';
import { PreferencesView } from './components/PreferencesView';
import { AuthModal } from './components/AuthModal';
import { Toast } from './components/Toast';

export const AppContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f8fc] text-[#1f2937]">
      <Header />

      <main className="flex-1">
        {activeTab === 'catalogue' && <CatalogueView />}
        {activeTab === 'favourites' && <FavouritesView />}
        {activeTab === 'preferences' && <PreferencesView />}
        {activeTab === 'history' && <HistoryView />}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-200/80 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-700 flex items-center justify-center">
              <img src="/img/wallet.png" alt="SmartSpend" className="w-4 h-4 object-contain" />
            </div>
            <span className="text-sm font-bold text-gray-900">SmartSpend</span>
          </div>
          <p className="text-xs text-gray-500">
            Fiscal Fresh • Comparing Checkers, Woolworths, Pick n Pay &amp; Shoprite in South Africa.
          </p>
        </div>
      </footer>

      {/* Drawers & Modals */}
      <NavigationDrawer />
      <CartDrawer />
      <AuthModal />
      <Toast />
    </div>
  );
};

export const App: React.FC = () => {
  return <AppContent />;
};

export default App;
