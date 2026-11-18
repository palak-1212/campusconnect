/* Smart Canteen: menu, cart and order tokens (all saved in localStorage) */
(function () {
  'use strict';
  const { ic, esc, toast, user, data: D, STEPS, orderStep } = window.CC;
  const menu = D.get('menu');
  const cart = {};            /* itemId -> qty (kept only while the page is open) */
  let category = 'All';

  const $ = id => document.getElementById(id);
  const find = id => menu.items.find(i => i.id === id);

  function renderChips() {
    $('catChips').innerHTML = ['All'].concat(menu.categories).map(c =>
      `<button class="chip ${c === category ? 'is-active' : ''}" data-cat="${esc(c)}">${esc(c)}</button>`).join('');
  }

  function renderMenu() {
    const items = menu.items.filter(i => category === 'All' || i.category === category);
    $('menuGrid').innerHTML = items.map(i => `
      <article class="card menu-item ${i.available ? '' : 'is-off'}">
        <div class="row-main">
          <strong>${esc(i.name)}</strong>
          <span>${i.veg ? 'Veg' : 'Non-veg'} &middot; ${esc(i.prep)}</span>
        </div>
        <div class="menu-foot">
          <b>Rs. ${i.price}</b>
          ${i.available
            ? `<button class="btn btn-primary btn-sm" data-add="${i.id}">Add</button>`
            : '<span class="badge tone-red">Unavailable</span>'}
        </div>
      </article>`).join('');
  }

  function renderCart() {
    const ids = Object.keys(cart);
    $('cartList').innerHTML = ids.map(id => {
      const i = find(id);
      return `<li class="list-row">
        <div class="row-main"><strong>${esc(i.name)}</strong><span>Rs. ${i.price} each</span></div>
        <div class="qty"><button class="icon-btn" data-dec="${id}" aria-label="Remove one ${esc(i.name)}">-</button>
          <span>${cart[id]}</span>
          <button class="icon-btn" data-inc="${id}" aria-label="Add one ${esc(i.name)}">+</button></div>
      </li>`;
    }).join('') || '<li class="empty">Your cart is empty.</li>';
    const total = ids.reduce((s, id) => s + find(id).price * cart[id], 0);
    $('cartTotal').textContent = 'Rs. ' + total;
  }

  function renderOrders() {
    const mine = D.get('orders').filter(o => o.user === user.username).reverse();
    $('orderList').innerHTML = mine.map(o => {
      const step = orderStep(o);
      return `<li class="list-row" style="flex-wrap:wrap">
        <div class="row-main"><strong>Token ${esc(o.id)} &middot; Rs. ${o.total}</strong>
          <span>${o.items.map(i => `${esc(i.name)} x${i.qty}`).join(', ')}</span></div>
        <span class="badge ${step === 3 ? 'tone-green' : 'tone-orange'}">${esc(STEPS[step])}</span>
        <ol class="pipeline" style="width:100%;margin-top:8px">${STEPS.map((s, i) =>
          `<li class="${i < step ? 'done' : i === step ? 'current' : ''}"><span class="step-dot">${ic(i < step ? 'check' : ['check', 'clock', 'bag', 'archive'][i])}</span><small>${esc(s)}</small></li>`).join('')}</ol>
      </li>`;
    }).join('') || '<li class="empty">No orders yet. Add something from the menu.</li>';
  }

  $('catChips').addEventListener('click', e => {
    const b = e.target.closest('[data-cat]'); if (!b) return;
    category = b.dataset.cat; renderChips(); renderMenu();
  });
  $('menuGrid').addEventListener('click', e => {
    const b = e.target.closest('[data-add]'); if (!b) return;
    cart[b.dataset.add] = (cart[b.dataset.add] || 0) + 1;
    renderCart(); toast(find(b.dataset.add).name + ' added');
  });
  $('cartList').addEventListener('click', e => {
    const inc = e.target.closest('[data-inc]'), dec = e.target.closest('[data-dec]');
    if (inc) cart[inc.dataset.inc]++;
    if (dec) { cart[dec.dataset.dec]--; if (cart[dec.dataset.dec] <= 0) delete cart[dec.dataset.dec]; }
    renderCart();
  });
  $('clearCart').addEventListener('click', () => { Object.keys(cart).forEach(k => delete cart[k]); renderCart(); });

  $('placeOrder').addEventListener('click', () => {
    const ids = Object.keys(cart);
    if (!ids.length) { toast('Your cart is empty'); return; }
    const orders = D.get('orders');
    const order = {
      id: 'T-' + (101 + orders.length),
      user: user.username,
      createdAt: Date.now(),
      items: ids.map(id => ({ id, name: find(id).name, qty: cart[id], price: find(id).price })),
      total: ids.reduce((s, id) => s + find(id).price * cart[id], 0)
    };
    orders.push(order);
    D.set('orders', orders);
    Object.keys(cart).forEach(k => delete cart[k]);
    renderCart(); renderOrders();
    toast('Order placed. Your token is ' + order.id);
  });

  renderChips(); renderMenu(); renderCart(); renderOrders();
  setInterval(renderOrders, 5000);
})();
