import React from 'react';
import { Menu, ShoppingBag } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Header: React.FC = () => {
  const {
    setIsNavOpen,
    setIsCartOpen,
    cart,
    budget,
    getTotalTrueCost,
    setActiveTab,
  } = useApp();

  const totalSpent = getTotalTrueCost();
  const remaining = budget - totalSpent;
  const pct = budget > 0 ? Math.min((totalSpent / budget) * 100, 100) : 0;
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const isOver = totalSpent >= budget && budget > 0;
  const isWarn = !isOver && totalSpent / budget >= 0.8 && budget > 0;

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Navigation Menu Toggle & Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsNavOpen(true)}
              className="p-2 -ml-2 rounded-lg text-gray-700 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            <button
              onClick={() => setActiveTab('catalogue')}
              className="flex items-center gap-2 group text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
                <img
                  src="/img/wallet.png"
                  alt="SmartSpend logo"
                  className="w-6 h-6 object-contain"
                  onError={(e) => {
                    // Fallback if image not loaded
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div>
                <span className="text-xl font-bold text-emerald-800 tracking-tight block leading-none">
                  SmartSpend
                </span>
                <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider block">
                  Fiscal Fresh SA
                </span>
              </div>
            </button>
          </div>

          {/* Center: Live Budget Meter (Desktop & Tablet) */}
          <div className="hidden md:flex flex-col items-center justify-center flex-1 max-w-md mx-6">
            <div className="w-full flex items-center justify-between text-xs font-medium mb-1">
              <span className="text-gray-600">
                {budget > 0 ? (
                  isOver ? (
                    <span className="text-red-600 font-semibold">
                      Over budget by R{Math.abs(remaining).toFixed(0)}
                    </span>
                  ) : (
                    <span>
                      <strong className="text-emerald-700">R{remaining.toFixed(0)}</strong> remaining of R{budget.toFixed(0)}
                    </span>
                  )
                ) : (
                  'Set a budget to start tracking'
                )}
              </span>
              <span className={`text-[11px] font-bold ${isOver ? 'text-red-600' : isWarn ? 'text-amber-600' : 'text-emerald-700'}`}>
                {budget > 0 ? `${Math.round((totalSpent / budget) * 100)}%` : '0%'}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isOver
                    ? 'bg-red-500'
                    : isWarn
                    ? 'bg-amber-500'
                    : 'bg-emerald-600'
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {/* Right: Cart Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 hover:text-emerald-900 transition-all shadow-sm flex items-center gap-2"
              aria-label="Open shopping list"
            >
              <ShoppingBag className="w-5 h-5 text-emerald-700" />
              <span className="hidden sm:inline text-sm font-semibold">
                R{totalSpent.toFixed(0)}
              </span>
              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-emerald-600 rounded-full">
                {totalItemsCount}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Budget Bar */}
        <div className="md:hidden py-2 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs font-medium mb-1">
            <span className="text-gray-600 truncate">
              {budget > 0 ? (
                isOver ? (
                  <span className="text-red-600 font-semibold">Over budget: R{Math.abs(remaining).toFixed(0)}</span>
                ) : (
                  <span>R{remaining.toFixed(0)} left of R{budget.toFixed(0)}</span>
                )
              ) : (
                'Set budget in cart'
              )}
            </span>
            <span className={`text-[11px] font-bold ${isOver ? 'text-red-600' : isWarn ? 'text-amber-600' : 'text-emerald-700'}`}>
              {budget > 0 ? `${Math.round((totalSpent / budget) * 100)}%` : '0%'}
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isOver ? 'bg-red-500' : isWarn ? 'bg-amber-500' : 'bg-emerald-600'
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>
    </header>
  );
};
