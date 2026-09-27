import React, { useState } from 'react';
import { Save, Check, MapPin, Sparkles, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserPreferences } from '../types';

export const PreferencesView: React.FC = () => {
  const { preferences, updatePreferences, showToast } = useApp();
  const [formData, setFormData] = useState<UserPreferences>(preferences);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const DIETARY_OPTIONS = [
    'Vegetarian',
    'Vegan',
    'Halal',
    'Kosher',
    'Gluten-free',
    'Dairy-free',
    'Low-Carb / Keto',
    'Pescatarian',
  ];

  const ALLERGY_OPTIONS = [
    'Peanuts',
    'Tree nuts',
    'Shellfish',
    'Fish',
    'Dairy',
    'Eggs',
    'Wheat',
    'Soy',
  ];

  const toggleArrayItem = (field: 'dietaryNeeds' | 'allergies', value: string) => {
    setFormData((prev) => {
      const arr = prev[field];
      const exists = arr.includes(value);
      return {
        ...prev,
        [field]: exists ? arr.filter((x) => x !== value) : [...arr, value],
      };
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updatePreferences(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          Shopper Preferences &amp; Profile
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          These settings personalize your AI product recommendations, dietary filtering, and store travel calculations.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Address & Store Proximity */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-emerald-700" />
            <h2 className="text-base font-bold text-gray-900">
              Delivery / Home Address
            </h2>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Street Address &amp; Suburb (South Africa)
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              placeholder="e.g. 14 Musgrave Road, Berea, Durban, 4001"
              required
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Used to calculate proximity to Checkers, Woolworths, Pick n Pay, and Shoprite stores and estimate taxi/bus fares.
            </p>
          </div>
        </div>

        {/* Dietary Needs & Allergies */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-emerald-700" />
            <h2 className="text-base font-bold text-gray-900">
              Dietary Profile &amp; Allergies
            </h2>
          </div>

          {/* Dietary Needs */}
          <div className="mb-5">
            <label className="text-xs font-semibold text-gray-700 block mb-2">
              Dietary Needs &amp; Religious Requirements
            </label>
            <div className="flex flex-wrap gap-2">
              {DIETARY_OPTIONS.map((opt) => {
                const selected = formData.dietaryNeeds.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleArrayItem('dietaryNeeds', opt)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      selected
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Allergies */}
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-2 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              Allergens to Avoid (Strict Filter)
            </label>
            <div className="flex flex-wrap gap-2">
              {ALLERGY_OPTIONS.map((opt) => {
                const selected = formData.allergies.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleArrayItem('allergies', opt)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      selected
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Shopping Habits & Styles */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-gray-900 mb-2">
            Shopping Habits &amp; Lifestyle
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Shopping Frequency */}
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Shopping Frequency
              </label>
              <select
                value={formData.shoppingFrequency}
                onChange={(e) =>
                  setFormData({ ...formData, shoppingFrequency: e.target.value as any })
                }
                className="w-full px-3 py-2 bg-gray-50/70 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              >
                <option value="Weekly">Weekly Grocery Run</option>
                <option value="Bi-weekly">Every Two Weeks</option>
                <option value="Monthly">Monthly Bulk Shop</option>
                <option value="Ad-hoc">Ad-hoc as needed</option>
              </select>
            </div>

            {/* Product Style */}
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Brand Preference / Product Style
              </label>
              <select
                value={formData.productStyle}
                onChange={(e) =>
                  setFormData({ ...formData, productStyle: e.target.value as any })
                }
                className="w-full px-3 py-2 bg-gray-50/70 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              >
                <option value="Budget-first">Budget-first (Lowest price house brands)</option>
                <option value="Value & Balance">Value &amp; Balance (Quality essentials)</option>
                <option value="Premium & Organic">Premium &amp; Organic (Free-range/Woolies)</option>
              </select>
            </div>

            {/* Cooking Style */}
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Cooking Style
              </label>
              <select
                value={formData.cookingStyle}
                onChange={(e) =>
                  setFormData({ ...formData, cookingStyle: e.target.value as any })
                }
                className="w-full px-3 py-2 bg-gray-50/70 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              >
                <option value="Quick & 30-min">Quick &amp; 30-minute meals</option>
                <option value="Meal-prep & Batch">Meal-prep &amp; Batch cooking</option>
                <option value="Home Gourmet">Home Gourmet / Weekend culinary</option>
                <option value="Balanced Family">Balanced Family classics</option>
              </select>
            </div>

            {/* Lifestyle */}
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Household Lifestyle
              </label>
              <select
                value={formData.lifestyle}
                onChange={(e) =>
                  setFormData({ ...formData, lifestyle: e.target.value as any })
                }
                className="w-full px-3 py-2 bg-gray-50/70 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              >
                <option value="Student / Solo">Student / Solo Shopper</option>
                <option value="Young Couple">Young Couple</option>
                <option value="Family with Kids">Family with Kids</option>
                <option value="Fitness & Active">Fitness &amp; Active High-Protein</option>
              </select>
            </div>
          </div>

          {/* Notifications */}
          <div className="pt-2 flex items-center justify-between border-t border-gray-100">
            <div>
              <span className="text-xs font-bold text-gray-800 block">
                Budget &amp; Price Alert Notifications
              </span>
              <span className="text-[11px] text-gray-500 block">
                Receive warnings when reaching 80% and 100% of your food budget.
              </span>
            </div>
            <input
              type="checkbox"
              checked={formData.notifications}
              onChange={(e) =>
                setFormData({ ...formData, notifications: e.target.checked })
              }
              className="w-4 h-4 text-emerald-700 rounded border-gray-300 focus:ring-emerald-600"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            className="px-6 py-3 bg-emerald-700 text-white font-bold text-sm rounded-xl hover:bg-emerald-800 transition-all shadow-md shadow-emerald-700/20 flex items-center gap-2"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4" /> Preferences Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Preferences
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
