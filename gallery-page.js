(function () {
  /** @returns {HTMLElement|null} */
  function qs(sel) {
    return document.querySelector(sel);
  }

  function currentFilter() {
    var active = document.querySelector('[data-filter].is-active');
    return active ? active.getAttribute('data-filter') || 'All' : 'All';
  }

  /** @type {HTMLElement|null} */
  var overlayAll = qs('[data-modal-all]');

  /** @type {HTMLElement|null} */
  var payOverlay = qs('[data-pay-overlay]');

  function renderCards(container, items) {
    if (!container) return;
    container.innerHTML = '';
    if (!items.length) {
      container.innerHTML =
        '<p class="muted">No products in this category. Use <a href="admin.html">Staff</a> to add.</p>';
      return;
    }
    items.forEach(function (p) {
      var card = document.createElement('article');
      card.className = 'product-card';
      card.innerHTML =
        '<img src="' +
        escapeAttr(p.imageSrc) +
        '" alt="" loading="lazy" />' +
        '<div class="product-meta">' +
        '<h3>' +
        escapeHtml(p.title) +
        '</h3>' +
        '<p class="product-cat muted">' +
        escapeHtml(p.category) +
        '</p>' +
        '<p class="price">₹' +
        p.price.toFixed(2) +
        '</p>' +
        '<p class="muted small">' +
        escapeHtml(p.description) +
        '</p>' +
        '<button type="button" class="btn btn-primary btn-block mt-sm" data-add-cart data-id="' +
        escapeAttr(p.id) +
        '">Add to cart</button>' +
        '</div>';
      container.appendChild(card);
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  }

  function escapeAttr(s) {
    return String(s).replace(/"/g, '&quot;').replace(/</g, '&lt;');
  }

  function refreshGrid() {
    var grid = qs('[data-product-grid]');
    var cats = CatalogStore.filterByCategory(currentFilter());
    renderCards(grid, cats);
  }

  function openModal(items) {
    if (!overlayAll) return;
    var body = overlayAll.querySelector('[data-modal-grid]');
    renderCards(body, items);
    overlayAll.hidden = false;
    overlayAll.classList.add('is-open');
  }

  function closeModal() {
    if (!overlayAll) return;
    overlayAll.hidden = true;
    overlayAll.classList.remove('is-open');
  }

  function renderCartSidebar() {
    var list = qs('[data-cart-lines]');
    var sub = qs('[data-cart-subtotal]');
    var count = qs('[data-cart-badge]');
    if (!list) return;

    var s = Cart.getSummary();
    if (count) count.textContent = s.linesDetail.reduce(function (a, d) { return a + d.qty }, 0) || '';

    list.innerHTML = '';
    if (!s.linesDetail.length) {
      list.innerHTML = '<p class="muted">Cart is empty.</p>';
      if (sub) sub.textContent = '₹0.00';
      return;
    }

    s.linesDetail.forEach(function (d) {
      var row = document.createElement('div');
      row.className = 'cart-line';
      row.innerHTML =
        '<div>' +
        '<strong>' +
        escapeHtml(d.product.title) +
        '</strong>' +
        '<div class="muted small">₹' +
        d.product.price.toFixed(2) +
        ' × ' +
        '</div>' +
        '</div>' +
        '<div class="cart-line-actions">' +
        '<input type="number" min="1" value="' +
        d.qty +
        '" data-cart-qty data-id="' +
        escapeAttr(d.product.id) +
        '" aria-label="Quantity" />' +
        '<button type="button" class="btn btn-ghost btn-sm" data-cart-remove data-id="' +
        escapeAttr(d.product.id) +
        '">Remove</button>' +
        '</div>' +
        '<div class="cart-line-total">₹' +
        d.lineTotal.toFixed(2) +
        '</div>';
      list.appendChild(row);
    });

    if (sub) sub.textContent = '₹' + s.subtotal.toFixed(2);
  }

  function wire() {
    document.querySelectorAll('[data-filter]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('[data-filter]').forEach(function (b) {
          return b.classList.remove('is-active');
        });
        btn.classList.add('is-active');
        refreshGrid();
      });
    });

    var btnAll = qs('[data-action-view-all]');
    if (btnAll)
      btnAll.addEventListener('click', function () {
        openModal(CatalogStore.getCatalog());
      });

    document.addEventListener('click', function (e) {
      var btn = /** @type {HTMLElement|null} */ (e.target && e.target.closest && e.target.closest('[data-add-cart]'));
      if (btn) {
        var id = btn.getAttribute('data-id');
        if (id) Cart.addProduct(id, 1);
      }
      var rm = /** @type {HTMLElement|null} */ (e.target && e.target.closest && e.target.closest('[data-cart-remove]'));
      if (rm) Cart.removeLine(rm.getAttribute('data-id'));
    });

    document.addEventListener('change', function (e) {
      var inp = /** @type {HTMLInputElement|null} */ (e.target && e.target.closest && e.target.closest('[data-cart-qty]'));
      if (inp) Cart.setQty(inp.getAttribute('data-id'), inp.value);
    });

    if (overlayAll) {
      overlayAll.addEventListener('click', function (ev) {
        if (
          ev.target === overlayAll ||
          (ev.target.closest && ev.target.closest('[data-modal-close]'))
        )
          closeModal();
      });
    }

    var clearBtn = qs('[data-clear-cart]');
    if (clearBtn)
      clearBtn.addEventListener('click', function () {
        if (confirm('Clear all items from cart?')) Cart.clearCart();
      });

    var payBtn = qs('[data-pay-now]');
    if (payBtn && payOverlay)
      payBtn.addEventListener('click', function () {
        var sum = Cart.getSummary();
        if (!sum.linesDetail.length) {
          alert('Add items before paying.');
          return;
        }
        Checkout.openPayModal(payOverlay, sum.subtotal);
      });

    var waBtn = qs('[data-whatsapp-order]');
    if (waBtn)
      waBtn.addEventListener('click', function () {
        if (!Checkout.openWhatsAppOrder()) alert('Cart is empty.');
      });

    var printBtn = qs('[data-print-bill]');
    if (printBtn)
      printBtn.addEventListener('click', function () {
        ReceiptPrint.printReceiptForCurrentCart();
      });

    window.addEventListener('krishna-cart-updated', function () {
      renderCartSidebar();
    });

    if (payOverlay) Checkout.wirePayOverlay(payOverlay);

    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && overlayAll && overlayAll.classList.contains('is-open'))
        closeModal();
    });

    refreshGrid();
    renderCartSidebar();
  }

  if (document.querySelector('[data-product-grid]')) {
    wire();
  }
})();
