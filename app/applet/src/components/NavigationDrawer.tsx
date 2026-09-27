import React from 'react';
import { X, Heart, Settings, History, ShoppingCart, LogOut, User as UserIcon, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const NavigationDrawer: React.FC = () => {
  const {
    isNavOpen,
    setIsNavOpen,
    activeTab,
    setActiveTab,
    user,
    logout,
    setIsAuthModalOpen,
    setIsAiChatOpen,
  } = useApp() as any;

  if (!isNavOpen) return null;

  const letter = user?.name ? user.name.charAt(0).toUpperCase() : 'E';

  const handleNav = (tab: 'catalogue' | 'favourites' | 'preferences' | 'history') => {
    setActiveTab(tab);
    setIsNavOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={() => setIsNavOpen(false)}
      />
      <div className="fixed inset-y-0 left-0 max-w-full flex">
        <div className="w-screen max-w-xs bg-white shadow-2xl flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Menu</h2>
              <button
                onClick={() => setIsNavOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Profile Card */}
            <div className="p-4 border-b border-gray-100 bg-gray-50/70">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-emerald-700 text-white font-bold text-lg flex items-center justify-center shadow-sm">
                    {letter}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center">
                      <UserIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Guest Shopper</p>
                      <p className="text-xs text-gray-500">Sign in to sync lists</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsNavOpen(false);
                      setIsAuthModalOpen(true);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100"
                  >
                    Sign In
                  </button>
                </div>
              )}
            </div>

            {/* Navigation links */}
            <nav className="p-3 space-y-1">
              <button
                onClick={() => handleNav('catalogue')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === 'catalogue'
                    ? 'bg-emerald-50 text-emerald-800 font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <ShoppingCart className="w-5 h-5 text-emerald-600" />
                Grocery Catalogue
              </button>

              <button
                onClick={() => {
                  setIsNavOpen(false);
                  setIsAiChatOpen(true);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium bg-emerald-50/80 text-emerald-900 hover:bg-emerald-100 font-semibold transition-colors border border-emerald-200/60"
              >
                <Sparkles className="w-5 h-5 text-emerald-700" />
                AI Grocery Assistant
              </button>

              <button
                onClick={() => handleNav('favourites')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === 'favourites'
                    ? 'bg-emerald-50 text-emerald-800 font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Heart className="w-5 h-5 text-emerald-600" />
                My Favourites &amp; Hidden
              </button>

              <button
                onClick={() => handleNav('preferences')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === 'preferences'
                    ? 'bg-emerald-50 text-emerald-800 font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Settings className="w-5 h-5 text-emerald-600" />
                Dietary &amp; Shopping Preferences
              </button>

              <button
                onClick={() => handleNav('history')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === 'history'
                    ? 'bg-emerald-50 text-emerald-800 font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <History className="w-5 h-5 text-emerald-600" />
                Shopping List Export History
              </button>
            </nav>
          </div>

          {/* Footer actions */}
          <div className="p-4 border-t border-gray-100">
            {user ? (
              <button
                onClick={() => {
                  logout();
                  setIsNavOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsNavOpen(false);
                  setIsAuthModalOpen(true);
                }}
                className="w-full py-2.5 bg-emerald-700 text-white rounded-xl text-sm font-semibold hover:bg-emerald-800 transition-colors shadow-sm"
              >
                Sign In / Register
              </button>
            )}
            <p className="mt-4 text-center text-xs text-gray-400">
              SmartSpend • Version 1.0.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
