import React, { useState } from 'react';
import { X, MapPin, Navigation } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { STORES } from '../data/mockProducts';
import { Retailer } from '../types';

interface DistanceFilterModalProps {
  maxDistance: number;
  setMaxDistance: (km: number) => void;
}

export const DistanceFilterModal: React.FC<DistanceFilterModalProps> = ({
  maxDistance,
  setMaxDistance,
}) => {
  const { isDistanceModalOpen, setIsDistanceModalOpen, preferences, updatePreferences } = useApp();
  const [addressInput, setAddressInput] = useState(preferences.address);

  if (!isDistanceModalOpen) return null;

  const stores = Object.keys(STORES) as Retailer[];

  const handleSave = () => {
    updatePreferences({ address: addressInput });
    setIsDistanceModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={() => setIsDistanceModalOpen(false)}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 border border-gray-100">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Store Distance &amp; Location
                </h3>
                <p className="text-xs text-gray-500">
                  Filter stores by distance from your home address
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsDistanceModalOpen(false)}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-4 space-y-4">
            {/* Address Input */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Your Delivery / Home Address (Durban / SA)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={addressInput}
                  onChange={(e) => setAddressInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  placeholder="e.g. 14 Musgrave Road, Berea, Durban"
                />
                <Navigation className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Slider */}
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-gray-700">Maximum Store Radius</span>
                <span className="text-sm font-extrabold text-emerald-800">
                  {maxDistance >= 25 ? 'Any distance (25+ km)' : `${maxDistance} km`}
                </span>
              </div>
              <input
                type="range"
                min="2"
                max="25"
                step="1"
                value={maxDistance}
                onChange={(e) => setMaxDistance(parseInt(e.target.value))}
                className="w-full accent-emerald-700 h-2 bg-gray-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>2 km</span>
                <span>10 km</span>
                <span>25+ km</span>
              </div>
            </div>

            {/* Stores List with Distances */}
            <div>
              <span className="text-xs font-bold text-gray-700 block mb-2">
                Nearby Supermarkets
              </span>
              <div className="space-y-2">
                {stores.map((store) => {
                  const meta = STORES[store];
                  const inRange = meta.distanceKm <= maxDistance || maxDistance >= 25;

                  return (
                    <div
                      key={store}
                      className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                        inRange
                          ? 'bg-white border-gray-200 text-gray-900'
                          : 'bg-gray-50 border-gray-100 text-gray-400 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={meta.logo}
                          alt={store}
                          className="w-5 h-5 rounded-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div>
                          <p className="text-xs font-bold">{store}</p>
                          <p className="text-[10px] text-gray-500">{meta.address}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-semibold ${inRange ? 'text-emerald-700' : 'text-gray-400'}`}>
                        {meta.distanceKm} km
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <button
              onClick={() => setIsDistanceModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold bg-emerald-700 text-white rounded-xl hover:bg-emerald-800 shadow-sm"
            >
              Apply Filter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
