import React, { useState, useMemo } from 'react';
import { Search, ArrowUpDown, ChevronDown, Filter, MapPin, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ProductCard } from './ProductCard';
import { AIRecommendations } from './AIRecommendations';
import { DistanceFilterModal } from './DistanceFilterModal';
import { CATEGORY_ICONS, STORES } from '../data/mockProducts';
import { CategoryName, Retailer } from '../types';

export const CatalogueView: React.FC = () => {
  const {
    products,
    dislikes,
    preferences,
    setIsDistanceModalOpen,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRetailer, setSelectedRetailer] = useState<Retailer | 'All'>('All');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [dietaryOnly, setDietaryOnly] = useState(false);
  const [maxDistance, setMaxDistance] = useState<number>(25);
  const [storeMenuOpen, setStoreMenuOpen] = useState(false);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Hidden / disliked items are completely excluded
      if (dislikes.has(p.id)) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesCat = p.category.toLowerCase().includes(q);
        const matchesStore = p.retailer.toLowerCase().includes(q);
        if (!matchesTitle && !matchesCat && !matchesStore) return false;
      }

      // Retailer filter
      if (selectedRetailer !== 'All' && p.retailer !== selectedRetailer) {
        return false;
      }

      // Distance filter
      if (maxDistance < 25) {
        const storeMeta = STORES[p.retailer];
        if (storeMeta && storeMeta.distanceKm > maxDistance) {
          return false;
        }
      }

      // Dietary filter chip
      if (dietaryOnly) {
        const isVeg = preferences.dietaryNeeds.some(d =>
          d.toLowerCase().includes('veg')
        );
        if (isVeg && p.category === 'Meat') return false;

        if (preferences.allergies && preferences.allergies.length > 0) {
          const lowerAllergies = preferences.allergies.map(a => a.toLowerCase());
          if (
            p.dietaryTags?.some(tag =>
              lowerAllergies.some(a => tag.includes(a) || a.includes(tag))
            )
          ) {
            return false;
          }
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortOrder === 'asc') return a.price - b.price;
      return b.price - a.price;
    });
  }, [products, dislikes, searchQuery, selectedRetailer, maxDistance, dietaryOnly, sortOrder, preferences]);

  // Group by category
  const categories: CategoryName[] = [
    'Fruits',
    'Vegetables',
    'Meat',
    'Rice',
    'Dairy,Eggs & Milk',
    'Snacks',
  ];

  const productsByCategory = useMemo(() => {
    const map = new Map<CategoryName, typeof filteredProducts>();
    categories.forEach(cat => map.set(cat, []));

    filteredProducts.forEach(p => {
      const list = map.get(p.category) || [];
      list.push(p);
      map.set(p.category, list);
    });

    return map;
  }, [filteredProducts]);

  const scrollToCategory = (cat: CategoryName) => {
    const el = document.getElementById(`cat-${cat}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Search Bar */}
      <div className="relative mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder='Try "2L milk", "rice", "strawberries" or "Checkers"...'
          className="w-full pl-11 pr-4 py-3.5 bg-white rounded-2xl border border-gray-200/90 text-sm font-medium shadow-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none placeholder:text-gray-400"
        />
        <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 hover:text-gray-700"
          >
            Clear
          </button>
        )}
      </div>

      {/* Filter Chips Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
        {/* Sort: Price */}
        <button
          onClick={() => setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))}
          className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 shadow-xs ${
            sortOrder === 'asc'
              ? 'bg-emerald-700 text-white border-emerald-700'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
          }`}
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
          Sort: Price {sortOrder === 'asc' ? '↑' : '↓'}
        </button>

        {/* Store Dropdown Filter */}
        <div className="relative shrink-0">
          <button
            onClick={() => setStoreMenuOpen(!storeMenuOpen)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 shadow-xs ${
              selectedRetailer !== 'All'
                ? 'bg-emerald-700 text-white border-emerald-700'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{selectedRetailer === 'All' ? 'Store: All' : selectedRetailer}</span>
            <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
          </button>

          {storeMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setStoreMenuOpen(false)}
              />
              <div className="absolute left-0 top-full mt-1.5 w-44 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-30 divide-y divide-gray-50">
                <button
                  onClick={() => {
                    setSelectedRetailer('All');
                    setStoreMenuOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs font-semibold hover:bg-emerald-50 ${
                    selectedRetailer === 'All' ? 'text-emerald-700 bg-emerald-50/50' : 'text-gray-700'
                  }`}
                >
                  All Supermarkets
                </button>
                {(['Checkers', 'Woolworths', 'Pick n Pay', 'Shoprite'] as Retailer[]).map((ret) => (
                  <button
                    key={ret}
                    onClick={() => {
                      setSelectedRetailer(ret);
                      setStoreMenuOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs font-semibold hover:bg-emerald-50 ${
                      selectedRetailer === ret ? 'text-emerald-700 bg-emerald-50/50' : 'text-gray-700'
                    }`}
                  >
                    {ret}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Distance Filter */}
        <button
          onClick={() => setIsDistanceModalOpen(true)}
          className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 shadow-xs ${
            maxDistance < 25
              ? 'bg-emerald-700 text-white border-emerald-700'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          Distance {maxDistance < 25 ? `(≤ ${maxDistance}km)` : '▾'}
        </button>

        {/* Dietary Match Filter */}
        <button
          onClick={() => setDietaryOnly(!dietaryOnly)}
          className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 shadow-xs ${
            dietaryOnly
              ? 'bg-emerald-700 text-white border-emerald-700'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
          }`}
          title="Filter to items compliant with your dietary profile"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Dietary Filter {dietaryOnly ? 'Active' : ''}
        </button>
      </div>

      {/* Category Fast-Jump Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
        {categories.map((cat) => {
          const icon = CATEGORY_ICONS[cat] || '/img/fruit.gif';
          return (
            <button
              key={cat}
              onClick={() => scrollToCategory(cat)}
              className="shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200 hover:border-emerald-600 hover:bg-emerald-50/50 text-xs font-semibold text-gray-700 transition-all shadow-2xs"
            >
              <img
                src={icon}
                alt={cat}
                className="w-5 h-5 object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span>{cat}</span>
            </button>
          );
        })}
      </div>

      {/* AI Recommendations Section */}
      <AIRecommendations />

      {/* Category Product Sections */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 p-8 shadow-xs">
          <p className="text-base font-bold text-gray-800">No products match your filters</p>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query, increasing store radius distance, or resetting the dietary filter.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedRetailer('All');
              setMaxDistance(25);
              setDietaryOnly(false);
            }}
            className="mt-4 px-4 py-2 bg-emerald-700 text-white text-xs font-bold rounded-xl hover:bg-emerald-800 transition-colors shadow-xs"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="space-y-10">
          {categories.map((cat) => {
            const items = productsByCategory.get(cat) || [];
            if (items.length === 0) return null;

            const icon = CATEGORY_ICONS[cat] || '/img/fruit.gif';

            return (
              <section key={cat} id={`cat-${cat}`} className="scroll-mt-24">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-white border border-gray-200/80 shadow-xs flex items-center justify-center p-1">
                    <img
                      src={icon}
                      alt={cat}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 tracking-tight">
                      {cat}
                    </h2>
                    <span className="text-[11px] text-gray-500 font-medium">
                      {items.length} items available
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-4">
                  {items.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* Distance Modal */}
      <DistanceFilterModal
        maxDistance={maxDistance}
        setMaxDistance={setMaxDistance}
      />
    </div>
  );
};
