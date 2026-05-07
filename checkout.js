(function () {
  /** @returns {string} */
  function buildUpiUrl(amount) {
    var pa = encodeURIComponent(SHOP_CONFIG.upiId);
    var pn = encodeURIComponent(SHOP_CONFIG.upiPayeeName || 'Shop');
    var am = typeof amount === 'number' ? amount.toFixed(2) : String(amount || '0');
    return (
      'upi://pay?pa=' +
      pa +
      '&pn=' +
      pn +
      '&am=' +
      encodeURIComponent(am) +
      '&cu=INR'
    );
  }

  function qrImageSrc(upiData) {
    return (
      'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=' + encodeURIComponent(upiData)
    );
  }

  /** @param {HTMLElement} overlay */
  /** @param {number} total */
  function openPayModal(overlay, total) {
    var upi = buildUpiUrl(total);
    var img = overlay.querySelector('[data-qr-img]');
    var link = overlay.querySelector('[data-upi-link]');
    if (img) img.src = qrImageSrc(upi);
    if (link) {
      link.href = upi;
      link.textContent = 'Open UPI app';
    }

    overlay.hidden = false;
    overlay.classList.add('is-open');

    /** @type {HTMLElement|null} */
    var amountEl = overlay.querySelector('[data-pay-amount]');
    if (amountEl) amountEl.textContent = '₹' + Number(total).toFixed(2);
  }

  function closePayModal(overlay) {
    overlay.hidden = true;
    overlay.classList.remove('is-open');
  }

  /** Whatsapp prefilled summary */
  function orderSummaryWhatsAppText(summary) {
    var lines =
      summary.linesDetail.map(function (d) {
        return d.product.title + ' x' + d.qty + ' = ₹' + d.lineTotal.toFixed(2);
      }) || [];
    return (
      'Order inquiry — ' +
      SHOP_CONFIG.name +
      '\n' +
      lines.join('\n') +
      '\nTotal: ₹' +
      summary.subtotal.toFixed(2)
    );
  }

  /** @returns {boolean} opens wa.me — call from gallery */
  function openWhatsAppOrder() {
    var s = Cart.getSummary();
    if (!s.linesDetail.length) return false;
    window.open(whatsappHref(orderSummaryWhatsAppText(s)), '_blank');
    return true;
  }

  /** Wire overlay: close buttons + backdrop */
  function wirePayOverlay(overlay) {
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay || (e.target && e.target.closest && e.target.closest('[data-close-pay]')))
        closePayModal(overlay);
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && overlay.classList.contains('is-open')) closePayModal(overlay);
    });
  }

  window.Checkout = {
    buildUpiUrl: buildUpiUrl,
    qrImageSrc: qrImageSrc,
    openPayModal: openPayModal,
    closePayModal: closePayModal,
    orderSummaryWhatsAppText: orderSummaryWhatsAppText,
    openWhatsAppOrder: openWhatsAppOrder,
    wirePayOverlay: wirePayOverlay,
  };
})();
