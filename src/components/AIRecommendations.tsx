import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, ChevronDown, ChevronUp, Plus, Heart } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getSmartRecommendations } from '../services/aiRecommendationService';
import { AIRecommendation } from '../types';
import { STORES } from '../data/mockProducts';

export const AIRecommendations: React.FC = () => {
  const {
    products,
    preferences,
    favourites,
    dislikes,
    addToCart,
    toggleFavourite,
  } = useApp();

  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);

  const refreshRecommendations = () => {
    setLoading(true);
    setTimeout(() => {
      const recs = getSmartRecommendations(products, preferences, favourites, dislikes);
      setRecommendations(recs);
      setLoading(false);
    }, 400);
  };

  useEffect(() => {
    refreshRecommendations();
  }, [preferences, favourites, dislikes]);

  if (recommendations.length === 0) return null;

  return (
    <section className="bg-gradient-to-r from-emerald-900 to-emerald-800 text-white rounded-3xl p-5 sm:p-6 shadow-md shadow-emerald-900/10 mb-8 border border-emerald-700/40">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-400/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold tracking-tight text-white">
                Recommended for you
              </h2>
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-400/20 text-emerald-200 border border-emerald-400/30">
                AI Match
              </span>
            </div>
            <p className="text-xs text-emerald-200/80">
              Matched to your {preferences.lifestyle} lifestyle, {preferences.cookingStyle} cooking, and diet.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refreshRecommendations}
            disabled={loading}
            className="p-1.5 rounded-lg bg-emerald-700/60 hover:bg-emerald-700 text-emerald-100 hover:text-white transition-all text-xs font-medium flex items-center gap-1.5"
            title="Refresh recommendations"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 rounded-lg bg-emerald-700/60 hover:bg-emerald-700 text-emerald-100 hover:text-white transition-all"
            aria-label={isOpen ? 'Hide recommendations' : 'Show recommendations'}
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Body Carousel / Grid */}
      {isOpen && (
        <div className="mt-4 pt-4 border-t border-emerald-700/40">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
            {recommendations.slice(0, 5).map((rec) => {
              const originalProduct = products.find(p => p.id === rec.productId);
              const storeMeta = STORES[rec.retailer];
              const isFav = favourites.has(rec.productId);

              return (
                <div
                  key={rec.id}
                  className="bg-white text-gray-900 rounded-2xl p-3 border border-emerald-100 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-16/10 rounded-xl overflow-hidden bg-gray-100 mb-2.5">
                      <img
                        src={rec.imageUrl}
                        alt={rec.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute top-1.5 left-1.5 bg-white/90 px-1.5 py-0.5 rounded text-[10px] font-bold text-gray-700 flex items-center gap-1">
                        {storeMeta?.logo && (
                          <img src={storeMeta.logo} alt="" className="w-3 h-3 rounded-full" />
                        )}
                        {rec.retailer}
                      </div>

                      <button
                        onClick={() => toggleFavourite(rec.productId)}
                        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-white/90 text-gray-400 hover:text-rose-500"
                        aria-label="Toggle favourite"
                      >
                        <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                      </button>
                    </div>

                    <h4 className="text-xs font-bold text-gray-900 line-clamp-1">
                      {rec.title}
                    </h4>

                    {/* AI explanation pill */}
                    <div className="mt-1.5 p-1.5 bg-emerald-50 rounded-lg border border-emerald-100/60">
                      <p className="text-[10px] text-emerald-800 leading-tight italic">
                        "{rec.reason}"
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-sm font-extrabold text-emerald-700">
                      R{rec.price.toFixed(2)}
                    </span>

                    {originalProduct && (
                      <button
                        onClick={() => addToCart(originalProduct)}
                        className="p-1.5 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 transition-colors shadow-xs"
                        aria-label="Add recommendation to list"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};
