import React, { useState } from 'react';
import { Heart, EyeOff, RotateCcw, Plus, ShoppingBag } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { STORES } from '../data/mockProducts';

export const FavouritesView: React.FC = () => {
  const {
    products,
    favourites,
    dislikes,
    toggleFavourite,
    undislikeProduct,
    addToCart,
    setActiveTab,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'favourites' | 'dislikes'>('favourites');

  const favProducts = products.filter(p => favourites.has(p.id) && !dislikes.has(p.id));
  const dislikedProducts = products.filter(p => dislikes.has(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          Saved Products
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Manage your favourite items and hidden catalogue exclusions.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 gap-6">
        <button
          onClick={() => setActiveSubTab('favourites')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeSubTab === 'favourites'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Heart className={`w-4 h-4 ${activeSubTab === 'favourites' ? 'fill-emerald-700' : ''}`} />
          My Favourites ({favProducts.length})
        </button>

        <button
          onClick={() => setActiveSubTab('dislikes')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeSubTab === 'dislikes'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <EyeOff className="w-4 h-4" />
          Hidden Products ({dislikedProducts.length})
        </button>
      </div>

      {/* Favourites Tab Content */}
      {activeSubTab === 'favourites' && (
        <>
          {favProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 p-8 shadow-xs">
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-gray-800">No favourites saved yet</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                Click the heart icon on any grocery item in the catalogue to save it here for fast access.
              </p>
              <button
                onClick={() => setActiveTab('catalogue')}
                className="mt-4 px-5 py-2.5 bg-emerald-700 text-white text-xs font-bold rounded-xl hover:bg-emerald-800 transition-colors shadow-xs"
              >
                Browse Catalogue
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {favProducts.map((product) => {
                const storeMeta = STORES[product.retailer];
                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between overflow-hidden group"
                  >
                    <div className="relative aspect-4/3 bg-gray-50 overflow-hidden">
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute top-2 left-2 bg-white/95 px-2 py-0.5 rounded text-[11px] font-bold text-gray-800 flex items-center gap-1">
                        {storeMeta?.logo && (
                          <img src={storeMeta.logo} alt="" className="w-3.5 h-3.5 rounded-full" />
                        )}
                        {product.retailer}
                      </div>

                      <button
                        onClick={() => toggleFavourite(product.id)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-50 text-rose-600 shadow-xs"
                        title="Remove favourite"
                      >
                        <Heart className="w-4 h-4 fill-current" />
                      </button>
                    </div>

                    <div className="p-3.5 flex flex-col justify-between flex-1">
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase font-bold block mb-0.5">
                          {product.category}
                        </span>
                        <h4 className="text-xs font-bold text-gray-900 line-clamp-2">
                          {product.title}
                        </h4>
                      </div>

                      <div className="mt-3 pt-2 border-t border-gray-50 flex items-center justify-between">
                        <span className="text-sm font-extrabold text-emerald-800">
                          R{product.price.toFixed(2)}
                        </span>
                        <button
                          onClick={() => addToCart(product)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-bold flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Add
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Dislikes Tab Content */}
      {activeSubTab === 'dislikes' && (
        <>
          {dislikedProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 p-8 shadow-xs">
              <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-3">
                <EyeOff className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-gray-800">No hidden products</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                When you click "I don't want to see this again" on a product card, it will be listed here and excluded from your search and catalogue.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {dislikedProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-gray-200/80 p-3.5 flex items-center justify-between gap-3 shadow-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="w-12 h-12 rounded-xl object-cover shrink-0 bg-gray-50"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">
                        {product.title}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {product.retailer} • R{product.price.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => undislikeProduct(product.id)}
                    className="shrink-0 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-emerald-50 text-gray-700 hover:text-emerald-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Restore
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
