// ---------------- Store metadata (address + demo distance for Taxi/Bus fare band) ----------------
const STORES = {
  'Checkers': { address: 'Overport City, Durban', distanceKm: 3 },
  'Woolworths': { address: 'Westville Mall, Durban', distanceKm: 9 },
  'Shoprite': { address: 'Pavilion Mall, Durban', distanceKm: 14 },
  'Pick n Pay': { address: 'Musgrave Centre, Durban', distanceKm: 2 },
  "Food Lover's": { address: 'Kloof Street, Durban', distanceKm: 20 },
};

const DELIVERY_FEE = 37;
function taxiFareForDistance(km) {
  if (km <= 5) return 12;
  if (km <= 15) return 18;
  if (km <= 25) return 25;
  return 35;
}

// ---------------- App state ----------------
// Seeded to match the shopping-list mockups exactly (Checkers milk+bread w/ Delivery,
// Pick n Pay eggs w/ Walk, Woolworths apples w/ Taxi) so the True Cost math lines up.
let itemCounter = 4;
const state = {
  budget: 450,
  items: [
    { id: 'i1', name: '2L Full Cream Milk', price: 32.00, store: 'Checkers' },
    { id: 'i2', name: 'Bread', price: 18.00, store: 'Checkers' },
    { id: 'i3', name: 'Eggs', price: 45.00, store: 'Pick n Pay' },
    { id: 'i4', name: 'Apples 3kg', price: 60.00, store: 'Woolworths' },
  ],
  transport: {
    'Checkers': 'delivery',
    'Pick n Pay': 'walk',
    'Woolworths': 'taxi',
  },
  lastThresholdShown: 0,
};

// ---------------- Derived calculations ----------------
function groupItemsByStore() {
  const groups = {};
  state.items.forEach((item) => {
    if (!groups[item.store]) groups[item.store] = [];
    groups[item.store].push(item);
  });
  return groups;
}

function transportCost(store) {
  const method = state.transport[store];
  if (!method || method === 'walk') return 0;
  if (method === 'delivery') return DELIVERY_FEE;
  if (method === 'taxi') {
    const km = (STORES[store] && STORES[store].distanceKm) || 10;
    return taxiFareForDistance(km);
  }
  return 0;
}

function storeSubtotal(items) {
  return items.reduce((sum, i) => sum + i.price, 0);
}

function totalTrueCost() {
  const groups = groupItemsByStore();
  let total = 0;
  Object.keys(groups).forEach((store) => {
    total += storeSubtotal(groups[store]) + transportCost(store);
  });
  return total;
}

// ---------------- Toast ----------------
let toastTimer = null;
function showToast(message, type) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = 'toast show' + (type ? ' ' + type : '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.className = 'toast'; }, 3200);
}

function checkBudgetThresholds() {
  if (!state.budget || state.budget <= 0) return;
  const spent = totalTrueCost();
  const pct = (spent / state.budget) * 100;
  if (pct >= 100 && state.lastThresholdShown < 100) {
    showToast("You've gone over your food budget.", 'over');
    state.lastThresholdShown = 100;
  } else if (pct >= 80 && pct < 100 && state.lastThresholdShown < 80) {
    showToast("You've used 80% of your food budget.", 'warn');
    state.lastThresholdShown = 80;
  } else if (pct < 80) {
    state.lastThresholdShown = 0;
  }
}

// ---------------- Header budget bar ----------------
function renderHeaderBudget() {
  const fill = document.getElementById('header-budget-fill');
  const label = document.getElementById('budget-summary-text');
  const badge = document.getElementById('cart-badge');

  badge.textContent = state.items.length;

  if (!state.budget) {
    label.textContent = 'Set a budget to start tracking';
    fill.style.width = '0%';
    fill.classList.remove('warn', 'over');
    return;
  }
  const spent = totalTrueCost();
  const remaining = state.budget - spent;
  const pct = Math.min((spent / state.budget) * 100, 100);
  label.textContent = `R${remaining.toFixed(0)} remaining of R${state.budget.toFixed(0)}`;
  fill.style.width = pct + '%';
  fill.classList.remove('warn', 'over');
  if (spent >= state.budget) fill.classList.add('over');
  else if (spent / state.budget >= 0.8) fill.classList.add('warn');
}

// ---------------- Cart drawer ----------------
function iconBasket() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>`;
}
function iconTrash() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>`;
}
function iconPencil() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>`;
}

function renderCartDrawer() {
  const body = document.getElementById('cart-body');
  let html = '';

  // ---- Budget section ----
  if (!state.budget) {
    html += `
      <div class="budget-set-box">
        <p>Set Your Budget</p>
        <div class="budget-set-row">
          <span>R</span>
          <input type="number" id="budget-input" placeholder="0" min="1">
        </div>
        <button class="btn-primary" id="start-list-btn">Start Shopping List</button>
      </div>`;
  } else {
    const spent = totalTrueCost();
    const remaining = state.budget - spent;
    const pct = Math.min((spent / state.budget) * 100, 100);
    html += `
      <div class="budget-pill-row">
        <button class="budget-pill" id="budget-pill">${iconPencil()} Budget: R${state.budget.toFixed(0)}</button>
        <div class="budget-remaining">
          <div class="amount">R${remaining.toFixed(2)}</div>
          <div class="label">Remaining Budget</div>
        </div>
      </div>
      <div class="budget-set-row" id="budget-edit-row" style="display:none;">
        <span>R</span>
        <input type="number" id="budget-input" value="${state.budget}" min="1">
        <button class="btn-primary" id="budget-save-btn" style="width:auto;padding:8px 16px;">Save</button>
      </div>
      <div class="budget-track"><div class="budget-fill ${pct >= 100 ? 'over' : pct >= 80 ? 'warn' : ''}" style="width:${pct}%"></div></div>
      <div class="budget-meta-row"><span>R${spent.toFixed(0)} spent</span><span>${state.budget > 0 ? Math.round((spent / state.budget) * 100) : 0}% of budget used</span></div>`;
  }

  // ---- List content ----
  if (state.items.length === 0) {
    html += `
      <div class="empty-list">
        <div class="icon-circle">${iconBasket()}</div>
        <h3>Your list is empty</h3>
        <p>Add items from stores to see them here and track your spending.</p>
      </div>`;
  } else {
    const groups = groupItemsByStore();
    Object.keys(groups).forEach((store) => {
      const items = groups[store];
      const subtotal = storeSubtotal(items);
      const method = state.transport[store];
      const cost = transportCost(store);
      const trueCost = subtotal + cost;
      const address = (STORES[store] && STORES[store].address) || '';
      const taxiFare = (STORES[store] && taxiFareForDistance(STORES[store].distanceKm)) || 15;

      html += `<div class="store-group">
        <div class="store-group-name">${store.toUpperCase()} <span class="loc">(${address})</span></div>`;

      items.forEach((item) => {
        html += `<div class="line-item">
          <div>
            <div class="name">${item.name}</div>
            <div class="price">R${item.price.toFixed(2)}</div>
          </div>
          <button data-remove="${item.id}" aria-label="Remove item">${iconTrash()}</button>
        </div>`;
      });

      html += `<div class="subtotal-row"><span>Subtotal</span><span>R${subtotal.toFixed(2)}</span></div>
        <div class="transport-label">Transport Method</div>
        <div class="transport-options">
          <button class="transport-pill ${method === 'walk' ? 'selected' : ''}" data-store="${store}" data-method="walk">Walk (R0)</button>
          <button class="transport-pill ${method === 'delivery' ? 'selected' : ''}" data-store="${store}" data-method="delivery">Delivery (R${DELIVERY_FEE})</button>
          <button class="transport-pill ${method === 'taxi' ? 'selected' : ''}" data-store="${store}" data-method="taxi">Taxi/Bus (R${taxiFare})</button>
        </div>
        <div class="truecost-row"><span>True Cost</span><span>R${trueCost.toFixed(2)}</span></div>
      </div>`;
    });
  }

  body.innerHTML = html;

  // ---- Footer ----
  const footer = document.getElementById('cart-footer');
  if (state.budget && state.items.length > 0) {
    const groups = groupItemsByStore();
    const allChosen = Object.keys(groups).every((store) => !!state.transport[store]);
    const spent = totalTrueCost();
    const remaining = state.budget - spent;
    footer.innerHTML = `
      <div class="summary-row total"><span>Total True Cost</span><span class="amount green">R${spent.toFixed(2)}</span></div>
      <div class="summary-row"><span>Remaining Budget</span><span class="amount">R${remaining.toFixed(2)}</span></div>
      <button class="btn-primary" id="export-btn" style="display:flex;align-items:center;justify-content:center;gap:8px;" ${allChosen ? '' : 'disabled'}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px;">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><polyline points="14 2 14 8 20 8"/>
        </svg>
        Save &amp; Download Shopping List (PDF)
      </button>`;
    footer.style.display = 'block';
  } else {
    footer.innerHTML = `<p style="text-align:center;color:var(--text-muted);font-size:12.5px;margin:0;">SafeSpend • Fiscal Fresh</p>`;
    footer.style.display = 'block';
  }
}

function renderAll() {
  renderHeaderBudget();
  renderCartDrawer();
}

// ---------------- Actions ----------------
function addToList(name, price, store) {
  itemCounter += 1;
  state.items.push({ id: 'i' + itemCounter, name, price, store });
  renderAll();
  checkBudgetThresholds();
}

function removeItem(itemId) {
  state.items = state.items.filter((i) => i.id !== itemId);
  const groups = groupItemsByStore();
  Object.keys(state.transport).forEach((store) => {
    if (!groups[store]) delete state.transport[store];
  });
  renderAll();
  checkBudgetThresholds();
}

function setTransport(store, method) {
  state.transport[store] = method;
  renderAll();
  showToast('True Cost updated');
}

function setBudget(value) {
  const val = parseFloat(value);
  if (!isNaN(val) && val > 0) {
    state.budget = val;
    state.lastThresholdShown = 0;
    renderAll();
    checkBudgetThresholds();
  }
}

// ---------------- Drawer open/close ----------------
function openDrawer(id) {
  document.getElementById(id).classList.add('open');
  document.getElementById('overlay').classList.add('visible');
}
function closeDrawers() {
  document.getElementById('nav-drawer').classList.remove('open');
  document.getElementById('cart-drawer').classList.remove('open');
  document.getElementById('overlay').classList.remove('visible');
}

// ---------------- Event wiring ----------------
document.addEventListener('DOMContentLoaded', () => {
  renderAll();

  document.getElementById('nav-toggle').addEventListener('click', () => openDrawer('nav-drawer'));
  document.getElementById('cart-toggle').addEventListener('click', () => openDrawer('cart-drawer'));
  document.getElementById('overlay').addEventListener('click', closeDrawers);
  document.getElementById('nav-close').addEventListener('click', closeDrawers);
  document.getElementById('cart-close').addEventListener('click', closeDrawers);
  document.getElementById('logout-btn').addEventListener('click', () => { window.location.href = 'login.html'; });

  // Add-to-list buttons on product cards
  document.querySelectorAll('.add-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      addToList(btn.getAttribute('data-name'), parseFloat(btn.getAttribute('data-price')), btn.getAttribute('data-store'));
    });
  });

  // Filter chips (visual toggle only in this prototype)
  document.querySelectorAll('.chip').forEach((chip) => {
    chip.addEventListener('click', () => chip.classList.toggle('active'));
  });

  // Delegated events inside the cart drawer (re-rendered content)
  document.getElementById('cart-body').addEventListener('click', (e) => {
    const removeBtn = e.target.closest('[data-remove]');
    if (removeBtn) { removeItem(removeBtn.getAttribute('data-remove')); return; }

    const transportBtn = e.target.closest('.transport-pill');
    if (transportBtn) { setTransport(transportBtn.getAttribute('data-store'), transportBtn.getAttribute('data-method')); return; }

    if (e.target.closest('#start-list-btn')) {
      const input = document.getElementById('budget-input');
      setBudget(input.value);
      return;
    }
    if (e.target.closest('#budget-pill')) {
      const row = document.getElementById('budget-edit-row');
      row.style.display = row.style.display === 'none' ? 'flex' : 'none';
      return;
    }
    if (e.target.closest('#budget-save-btn')) {
      const input = document.getElementById('budget-input');
      setBudget(input.value);
      return;
    }
  });

  document.getElementById('cart-footer').addEventListener('click', (e) => {
    const exportBtn = e.target.closest('#export-btn');
    if (exportBtn && !exportBtn.disabled) {
      // Placeholder for FR-06: backend generates the PDF and logs Purchase History.
      alert('Shopping list would be exported as a PDF and saved to your Purchase History.');
    }
  });
});
