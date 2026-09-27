import React, { useState } from 'react';
import { X, Trash2, Edit2, Check, Download, ShoppingBag, Plus, Minus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { STORES, taxiFareForDistance, DELIVERY_FEE } from '../data/mockProducts';
import { Retailer, TransportMethod } from '../types';
import { generateShoppingListPDF } from '../services/pdfService';
import confetti from 'canvas-confetti';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    removeFromCart,
    updateQuantity,
    budget,
    setBudget,
    transportMethods,
    setTransportMethod,
    getStoreSubtotal,
    getStoreTransportCost,
    getTotalTrueCost,
    user,
    addHistoryItem,
    showToast,
  } = useApp();

  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState(budget.toString());
  const [isExporting, setIsExporting] = useState(false);

  if (!isCartOpen) return null;

  const totalSpent = getTotalTrueCost();
  const remaining = budget - totalSpent;
  const pct = budget > 0 ? Math.min((totalSpent / budget) * 100, 100) : 0;
  const isOver = totalSpent >= budget && budget > 0;
  const isWarn = !isOver && totalSpent / budget >= 0.8 && budget > 0;

  // Group items by store
  const storeGroups = cart.reduce((acc, item) => {
    if (!acc[item.retailer]) acc[item.retailer] = [];
    acc[item.retailer].push(item);
    return acc;
  }, {} as Record<Retailer, typeof cart>);

  const storesInCart = Object.keys(storeGroups) as Retailer[];

  const handleSaveBudget = () => {
    const val = parseFloat(budgetInput);
    if (!isNaN(val) && val > 0) {
      setBudget(val);
      setIsEditingBudget(false);
      showToast(`Budget set to R${val.toFixed(0)}`, 'success');
    }
  };

  const handleExportPDF = () => {
    try {
      setIsExporting(true);
      const { doc, filename } = generateShoppingListPDF({
        items: cart,
        transportMethods,
        budget,
        totalTrueCost: totalSpent,
        userEmail: user?.email,
        getStoreSubtotal,
        getStoreTransportCost,
      });

      doc.save(filename);

      // Save to export history
      addHistoryItem({
        filename,
        totalCost: totalSpent,
        budgetLimit: budget,
        itemCount: cart.reduce((s, i) => s + i.quantity, 0),
        stores: storesInCart,
        items: cart,
        transportMethods,
      });

      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.8 },
      });

      showToast('Shopping list downloaded successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Could not generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* Drawer Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-700" />
              <h2 className="text-lg font-bold text-gray-900">Shopping List &amp; Budget</h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {/* Budget Box */}
            <div className="bg-emerald-50/60 rounded-2xl p-4 border border-emerald-100/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                  Target Budget
                </span>
                <button
                  onClick={() => setIsEditingBudget(!isEditingBudget)}
                  className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  {isEditingBudget ? 'Cancel' : 'Edit Budget'}
                </button>
              </div>

              {isEditingBudget ? (
                <div className="flex gap-2 my-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-500">
                      R
                    </span>
                    <input
                      type="number"
                      value={budgetInput}
                      onChange={(e) => setBudgetInput(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-white rounded-xl border border-gray-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      placeholder="e.g. 500"
                      min="1"
                      autoFocus
                    />
                  </div>
                  <button
                    onClick={handleSaveBudget}
                    className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 flex items-center gap-1"
                  >
                    <Check className="w-4 h-4" /> Save
                  </button>
                </div>
              ) : (
                <div className="flex items-baseline justify-between my-1">
                  <div>
                    <span className="text-2xl font-extrabold text-emerald-900">
                      R{budget.toFixed(0)}
                    </span>
                    <span className="text-xs text-emerald-700 ml-1">total budget</span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-lg font-bold block ${
                        isOver ? 'text-red-600' : 'text-emerald-800'
                      }`}
                    >
                      {remaining >= 0 ? `R${remaining.toFixed(2)}` : `-R${Math.abs(remaining).toFixed(2)}`}
                    </span>
                    <span className="text-[11px] text-gray-500 block">
                      {remaining >= 0 ? 'remaining' : 'over budget'}
                    </span>
                  </div>
                </div>
              )}

              {/* Progress Bar */}
              <div className="w-full bg-emerald-100 rounded-full h-2.5 overflow-hidden my-2">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isOver ? 'bg-red-500' : isWarn ? 'bg-amber-500' : 'bg-emerald-600'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="flex justify-between text-[11px] text-gray-500 font-medium">
                <span>R{totalSpent.toFixed(2)} true cost spent</span>
                <span>{budget > 0 ? Math.round((totalSpent / budget) * 100) : 0}% of budget</span>
              </div>
            </div>

            {/* List items by store */}
            {cart.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-gray-800">Your shopping list is empty</h3>
                <p className="text-xs text-gray-500 max-w-xs mx-auto mt-1">
                  Add items from Woolworths, Checkers, Pick n Pay or Shoprite to calculate your true shopping costs with transport!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {storesInCart.map((store) => {
                  const items = storeGroups[store];
                  const subtotal = getStoreSubtotal(store);
                  const transportCost = getStoreTransportCost(store);
                  const storeTrueCost = subtotal + transportCost;
                  const currentMethod = transportMethods[store] || 'walk';
                  const storeMeta = STORES[store];
                  const taxiFare = storeMeta ? taxiFareForDistance(storeMeta.distanceKm) : 18;

                  return (
                    <div
                      key={store}
                      className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs"
                    >
                      {/* Store Header */}
                      <div className="p-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={storeMeta?.logo || '/img/checkers.jpg'}
                            alt={store}
                            className="w-5 h-5 rounded-full object-cover border border-gray-200"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          <div>
                            <span className="text-xs font-bold text-gray-900 uppercase">
                              {store}
                            </span>
                            {storeMeta && (
                              <span className="text-[10px] text-gray-500 block">
                                {storeMeta.address} (~{storeMeta.distanceKm} km)
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-xs font-bold text-emerald-800">
                          R{storeTrueCost.toFixed(2)}
                        </span>
                      </div>

                      {/* Items */}
                      <div className="divide-y divide-gray-100 p-2">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className="py-2 px-1 flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">
                                {item.title}
                              </p>
                              <p className="text-gray-500 text-[11px]">
                                R{item.price.toFixed(2)} each
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Quantity buttons */}
                              <div className="flex items-center border border-gray-200 rounded-lg">
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="p-1 text-gray-500 hover:text-emerald-700 hover:bg-gray-50 rounded-l-md"
                                  aria-label="Decrease quantity"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="px-2 font-semibold text-gray-700">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="p-1 text-gray-500 hover:text-emerald-700 hover:bg-gray-50 rounded-r-md"
                                  aria-label="Increase quantity"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              <span className="font-semibold text-gray-900 w-14 text-right">
                                R{(item.price * item.quantity).toFixed(2)}
                              </span>

                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="p-1 text-gray-400 hover:text-red-600 rounded-md"
                                aria-label="Remove item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Store Subtotal & Transport Options */}
                      <div className="p-3 bg-gray-50/70 border-t border-gray-100 space-y-2">
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>Items subtotal</span>
                          <span className="font-semibold">R{subtotal.toFixed(2)}</span>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                            Transport Method
                          </label>
                          <div className="grid grid-cols-3 gap-1.5">
                            <button
                              type="button"
                              onClick={() => setTransportMethod(store, 'walk')}
                              className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all text-center ${
                                currentMethod === 'walk'
                                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                              }`}
                            >
                              Walk (R0)
                            </button>
                            <button
                              type="button"
                              onClick={() => setTransportMethod(store, 'delivery')}
                              className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all text-center ${
                                currentMethod === 'delivery'
                                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                              }`}
                            >
                              Delivery (R{DELIVERY_FEE})
                            </button>
                            <button
                              type="button"
                              onClick={() => setTransportMethod(store, 'taxi')}
                              className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all text-center ${
                                currentMethod === 'taxi'
                                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                              }`}
                            >
                              Taxi (R{taxiFare})
                            </button>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-gray-200/60">
                          <span className="text-xs font-bold text-gray-900">
                            {store} True Cost
                          </span>
                          <span className="text-xs font-extrabold text-emerald-800">
                            R{storeTrueCost.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Drawer Footer */}
          {cart.length > 0 && (
            <div className="p-4 border-t border-gray-200 bg-white space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-bold text-gray-800">Total True Cost</span>
                <span className="text-xl font-extrabold text-emerald-800">
                  R{totalSpent.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-baseline text-xs">
                <span className="text-gray-500">Remaining Budget</span>
                <span
                  className={`font-bold ${
                    remaining >= 0 ? 'text-emerald-700' : 'text-red-600'
                  }`}
                >
                  {remaining >= 0 ? `R${remaining.toFixed(2)}` : `-R${Math.abs(remaining).toFixed(2)} (Over)`}
                </span>
              </div>

              <button
                onClick={handleExportPDF}
                disabled={isExporting}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 transition-all hover:scale-[1.01]"
              >
                <Download className="w-4 h-4" />
                {isExporting ? 'Generating PDF...' : 'Save & Download Shopping List (PDF)'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
