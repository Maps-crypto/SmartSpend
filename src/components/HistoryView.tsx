import React from 'react';
import { History as HistoryIcon, Download, Calendar, Store, ShoppingBag } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generateShoppingListPDF } from '../services/pdfService';

export const HistoryView: React.FC = () => {
  const {
    history,
    transportMethods,
    getStoreSubtotal,
    getStoreTransportCost,
    user,
    setActiveTab,
    showToast,
  } = useApp();

  const handleRedownload = (item: typeof history[0]) => {
    try {
      const { doc, filename } = generateShoppingListPDF({
        items: item.items.length > 0 ? item.items : [
          { id: 'h1', productId: 1, title: 'Pink Lady Apples 1.5kg', price: 36.99, retailer: 'Pick n Pay', category: 'Fruits', quantity: 1, imageUrl: '' },
          { id: 'h2', productId: 21, title: 'Clover Full Cream Milk 2L', price: 33.99, retailer: 'Checkers', category: 'Dairy,Eggs & Milk', quantity: 1, imageUrl: '' },
        ],
        transportMethods: item.transportMethods || transportMethods,
        budget: item.budgetLimit,
        totalTrueCost: item.totalCost,
        userEmail: user?.email,
        getStoreSubtotal,
        getStoreTransportCost,
      });

      doc.save(item.filename || filename);
      showToast('PDF re-downloaded successfully!', 'success');
    } catch (e) {
      console.error(e);
      showToast('Could not re-download PDF.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          Shopping List Export History
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Archived PDFs with True Cost breakdowns and supermarket transport allocations.
        </p>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 p-8 shadow-xs">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-3">
            <HistoryIcon className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-gray-800">No past exports yet</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
            Whenever you click "Save &amp; Download Shopping List (PDF)" in your cart, a record is preserved here for your household records.
          </p>
          <button
            onClick={() => setActiveTab('catalogue')}
            className="mt-4 px-5 py-2.5 bg-emerald-700 text-white text-xs font-bold rounded-xl hover:bg-emerald-800 transition-colors shadow-xs"
          >
            Create Shopping List
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {history.map((item) => {
            const date = new Date(item.dateExported);
            const dateStr = date.toLocaleDateString('en-ZA', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs hover:border-emerald-200 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-gray-900">
                      {item.filename}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-800">
                      PDF Export
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {dateStr}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Store className="w-3.5 h-3.5" />
                      {item.stores?.join(', ') || 'Supermarkets'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <ShoppingBag className="w-3.5 h-3.5" />
                      {item.itemCount} items
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
                  <div className="text-left sm:text-right">
                    <span className="text-base font-extrabold text-emerald-800 block">
                      R{item.totalCost.toFixed(2)}
                    </span>
                    <span className="text-[11px] text-gray-400 block -mt-0.5">
                      Budget: R{item.budgetLimit.toFixed(0)}
                    </span>
                  </div>

                  <button
                    onClick={() => handleRedownload(item)}
                    className="px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
