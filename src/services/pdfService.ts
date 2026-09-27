import { jsPDF } from 'jspdf';
import { CartItem, Retailer, TransportMethod } from '../types';
import { STORES } from '../data/mockProducts';

export interface PDFExportData {
  items: CartItem[];
  transportMethods: Record<Retailer, TransportMethod>;
  budget: number;
  totalTrueCost: number;
  userEmail?: string;
  getStoreSubtotal: (store: Retailer) => number;
  getStoreTransportCost: (store: Retailer) => number;
}

export function generateShoppingListPDF(data: PDFExportData): { doc: jsPDF; filename: string } {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const filename = `SmartSpend-Shopping-List-${now.toISOString().slice(0, 10)}.pdf`;

  // Brand Header
  doc.setFillColor(26, 122, 76); // #1a7a4c
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('SmartSpend', 16, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Smart Grocery Budget & True Cost Planner', 16, 25);

  doc.setFontSize(9);
  doc.text(`Generated: ${dateStr}`, 150, 18);
  if (data.userEmail) {
    doc.text(`User: ${data.userEmail}`, 150, 25);
  }

  // Budget Summary Banner
  let y = 42;
  doc.setFillColor(230, 244, 236); // #e6f4ec
  doc.roundedRect(16, y, 178, 22, 3, 3, 'F');

  doc.setTextColor(20, 92, 58);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('BUDGET SUMMARY', 22, y + 8);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(31, 41, 55);

  const budgetText = `Set Budget: R${data.budget.toFixed(2)}`;
  const spentText = `Total True Cost: R${data.totalTrueCost.toFixed(2)}`;
  const remaining = data.budget - data.totalTrueCost;
  const remainingText = `Remaining: R${remaining.toFixed(2)}`;

  doc.text(budgetText, 22, y + 16);
  doc.text(spentText, 80, y + 16);

  if (remaining < 0) {
    doc.setTextColor(220, 38, 38);
    doc.setFont('helvetica', 'bold');
  } else {
    doc.setTextColor(26, 122, 76);
  }
  doc.text(remainingText, 145, y + 16);

  y += 30;

  // Group items by store
  const storeGroups: Record<string, CartItem[]> = {};
  data.items.forEach(item => {
    if (!storeGroups[item.retailer]) storeGroups[item.retailer] = [];
    storeGroups[item.retailer].push(item);
  });

  const stores = Object.keys(storeGroups) as Retailer[];

  stores.forEach((store) => {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    const items = storeGroups[store];
    const subtotal = data.getStoreSubtotal(store);
    const transportCost = data.getStoreTransportCost(store);
    const method = data.transportMethods[store] || 'walk';
    const storeTrueCost = subtotal + transportCost;
    const storeMeta = STORES[store];

    // Store Section Header
    doc.setFillColor(243, 244, 246);
    doc.rect(16, y, 178, 8, 'F');
    doc.setTextColor(17, 24, 39);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(store.toUpperCase(), 20, y + 5.5);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128);
    if (storeMeta) {
      doc.text(`(${storeMeta.address} • ~${storeMeta.distanceKm} km)`, 70, y + 5.5);
    }

    y += 12;

    // Items list
    items.forEach((item) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(9.5);
      doc.setTextColor(31, 41, 55);
      doc.text(`• ${item.title}  (x${item.quantity})`, 22, y);

      const itemTotal = (item.price * item.quantity).toFixed(2);
      doc.text(`R${itemTotal}`, 175, y, { align: 'right' });

      y += 6.5;
    });

    // Store Subtotals & Transport
    y += 2;
    doc.setDrawColor(229, 231, 235);
    doc.line(22, y, 175, y);
    y += 5;

    doc.setFontSize(9);
    doc.setTextColor(75, 85, 99);
    doc.text('Groceries Subtotal:', 22, y);
    doc.text(`R${subtotal.toFixed(2)}`, 175, y, { align: 'right' });
    y += 5;

    const methodLabel =
      method === 'walk' ? 'Walk (R0)' : method === 'delivery' ? 'Home Delivery (R37)' : 'Taxi/Bus Fare';
    doc.text(`Transport Method (${methodLabel}):`, 22, y);
    doc.text(`R${transportCost.toFixed(2)}`, 175, y, { align: 'right' });
    y += 5;

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(20, 92, 58);
    doc.text(`${store} True Cost:`, 22, y);
    doc.text(`R${storeTrueCost.toFixed(2)}`, 175, y, { align: 'right' });
    doc.setFont('helvetica', 'normal');

    y += 12;
  });

  // Footer notes
  if (y > 260) {
    doc.addPage();
    y = 20;
  }
  doc.setDrawColor(26, 122, 76);
  doc.setLineWidth(0.5);
  doc.line(16, y, 194, y);
  y += 7;

  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175);
  doc.text('SmartSpend • SafeSpend Fiscal Fresh • Keep receipts to monitor weekly price variations', 105, y, {
    align: 'center',
  });

  return { doc, filename };
}
