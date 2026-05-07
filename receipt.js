(function () {
  /** Fill #printRoot for printing */
  /** @param {ReturnType<(typeof Cart)["getSummary"]>} summary */
  function fillReceipt(summary) {
    var root = document.getElementById('printRoot');
    if (!root) return;

    var now = new Date();
    root.innerHTML = '';

    var head = document.createElement('div');
    head.innerHTML =
      '<h1 class="bill-title">' +
      escapeHtml(SHOP_CONFIG.name) +
      '</h1>' +
      '<p class="bill-meta">' +
      escapeHtml(SHOP_CONFIG.addressLines.join(', ')) +
      '</p>' +
      '<p class="bill-meta">Tel: ' +
      escapeHtml(SHOP_CONFIG.phoneDisplay) +
      '</p>' +
      '<p class="bill-meta">' +
      now.toLocaleString() +
      '</p>' +
      '<hr class="bill-hr"/>';
    root.appendChild(head);

    var tbody = '';
    summary.linesDetail.forEach(function (d) {
      tbody +=
        '<tr><td>' +
        escapeHtml(d.product.title) +
        '</td><td>' +
        d.qty +
        '</td><td>' +
        d.product.price.toFixed(2) +
        '</td><td>' +
        d.lineTotal.toFixed(2) +
        '</td></tr>';
    });

    var table = document.createElement('div');
    table.innerHTML =
      '<table class="bill-table"><thead><tr>' +
      '<th>Item</th><th>Qty</th><th>Rate</th><th>Amt</th></tr></thead><tbody>' +
      tbody +
      '</tbody></table>' +
      '<p class="bill-total"><strong>Total payable: ₹' +
      summary.subtotal.toFixed(2) +
      '</strong></p>' +
      '<p class="bill-note">Retail / wholesale enquiries welcome. Confirm payment via WhatsApp.</p>';
    root.appendChild(table);
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function printReceiptForCurrentCart() {
    var summary = Cart.getSummary();
    if (!summary.linesDetail.length) {
      alert('Cart is empty.');
      return;
    }
    fillReceipt(summary);
    document.body.classList.add('print-receipt');
    window.addEventListener(
      'afterprint',
      function onAfter() {
        document.body.classList.remove('print-receipt');
        window.removeEventListener('afterprint', onAfter);
      },
      { once: true },
    );
    window.print();
  }

  window.ReceiptPrint = {
    fillReceipt: fillReceipt,
    printReceiptForCurrentCart: printReceiptForCurrentCart,
  };
})();
