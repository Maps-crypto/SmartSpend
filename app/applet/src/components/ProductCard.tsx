import React, { useState } from 'react';
import { Heart, Plus, MoreVertical, EyeOff } from 'lucide-react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';
import { STORES } from '../data/mockProducts';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const {
    favourites,
    toggleFavourite,
    dislikeProduct,
    addToCart,
    cart,
  } = useApp();

  const [menuOpen, setMenuOpen] = useState(false);

  const isFav = favourites.has(product.id);
  const cartItem = cart.find(c => c.productId === product.id);
  const storeMeta = STORES[product.retailer];

  return (
    <div className="relative bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group">
      {/* Top Image & Store Badge with clean aspect-square container */}
      <div className="relative aspect-square bg-gray-50/80 p-3 flex items-center justify-center overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.title}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-xs"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80';
          }}
        />

        {/* Store Logo Badge */}
        <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-xs px-2 py-1 rounded-lg shadow-xs flex items-center gap-1.5 border border-gray-200/60 z-10">
          {storeMeta?.logo && (
            <img
              src={storeMeta.logo}
              alt={product.retailer}
              className="w-4 h-4 rounded-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          )}
          <span className="text-[11px] font-bold text-gray-800 tracking-tight">
            {product.retailer}
          </span>
        </div>

        {/* Top-right Actions: Favourite & More */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 z-10">
          <button
            onClick={() => toggleFavourite(product.id)}
            className={`p-2 rounded-full shadow-xs transition-all ${
              isFav
                ? 'bg-rose-50 text-rose-600 scale-105'
                : 'bg-white/90 text-gray-400 hover:text-rose-500 hover:bg-white'
            }`}
            aria-label={isFav ? 'Remove from favourites' : 'Add to favourites'}
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
          </button>

          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-full bg-white/90 text-gray-400 hover:text-gray-700 hover:bg-white shadow-xs"
              aria-label="More options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-30">
                  <button
                    onClick={() => {
                      dislikeProduct(product.id);
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-red-50 hover:text-red-700 flex items-center gap-2"
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                    I don't want to see this again
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Dietary / Unit tag */}
        {product.dietaryTags && product.dietaryTags.length > 0 && (
          <div className="absolute bottom-2 left-2 flex flex-wrap gap-1 max-w-[85%] z-10">
            {product.dietaryTags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-black/70 text-white backdrop-blur-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Product Content */}
      <div className="p-3.5 flex flex-col justify-between flex-1 bg-white">
        <div>
          <span className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold block mb-0.5">
            {product.category}
          </span>
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">
            {product.title}
          </h3>
        </div>

        <div className="mt-3 pt-2 border-t border-gray-50 flex items-center justify-between">
          <div>
            <span className="text-base font-extrabold text-emerald-800">
              R{product.price.toFixed(2)}
            </span>
            {product.unit && (
              <span className="text-[11px] text-gray-400 block -mt-1 font-medium">
                {product.unit}
              </span>
            )}
          </div>

          <button
            onClick={() => addToCart(product)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              cartItem
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 hover:text-emerald-900'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            {cartItem ? `Added (${cartItem.quantity})` : 'Add to List'}
          </button>
        </div>
      </div>
    </div>
  );
};
