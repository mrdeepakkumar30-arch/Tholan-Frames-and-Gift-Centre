(function () {
  var STORAGE = 'krishna_shop_cart_v1';

  function readLines() {
    try {
      var raw = sessionStorage.getItem(STORAGE);
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  }

  /** @typedef {{ productId:string, qty:number }} CartLine */

  function writeLines(lines) {
    sessionStorage.setItem(STORAGE, JSON.stringify(lines));
  }

  /** @returns {CartLine[]} */
  function getLines() {
    return readLines().map(function (l) {
      return { productId: String(l.productId), qty: Math.max(1, Number(l.qty) || 1) };
    });
  }

  function clearCart() {
    sessionStorage.removeItem(STORAGE);
    dispatchUpdated();
  }

  function dispatchUpdated() {
    window.dispatchEvent(new CustomEvent('krishna-cart-updated'));
  }

  /** @returns {{ lines: CartLine[], subtotal:number, linesDetail: Array<{product:any, qty:number, lineTotal:number}> }} */
  function getSummary() {
    var lines = getLines();
    var subtotal = 0;
    /** @type {Array<{product: ReturnType<(typeof CatalogStore)["getProduct"]>, qty:number, lineTotal:number}>} */
    var detail = [];

    lines.forEach(function (l) {
      var p = window.CatalogStore && CatalogStore.getProduct(l.productId);
      if (!p) return;
      var lineTotal = p.price * l.qty;
      subtotal += lineTotal;
      detail.push({ product: p, qty: l.qty, lineTotal: lineTotal });
    });

    return { lines: lines, subtotal: subtotal, linesDetail: detail };
  }

  function addProduct(productId, qty) {
    qty = Math.max(1, Number(qty) || 1);
    var lines = getLines();
    var ix = lines.findIndex(function (l) {
      return l.productId === productId;
    });
    if (ix >= 0) lines[ix].qty += qty;
    else lines.push({ productId: productId, qty: qty });
    writeLines(lines);
    dispatchUpdated();
    return lines;
  }

  function setQty(productId, qty) {
    qty = Number(qty);
    var lines = getLines().filter(function (l) {
      return l.productId !== productId;
    });
    if (!isNaN(qty) && qty > 0) lines.push({ productId: productId, qty: qty });
    writeLines(lines);
    dispatchUpdated();
  }

  function removeLine(productId) {
    var lines = getLines().filter(function (l) {
      return l.productId !== productId;
    });
    writeLines(lines);
    dispatchUpdated();
  }

  /** @returns {number} cart line count units */
  function totalUnits() {
    return getLines().reduce(function (a, l) {
      return a + l.qty;
    }, 0);
  }

  window.Cart = {
    getLines: getLines,
    clearCart: clearCart,
    getSummary: getSummary,
    addProduct: addProduct,
    setQty: setQty,
    removeLine: removeLine,
    totalUnits: totalUnits,
    dispatchUpdated: dispatchUpdated,
  };
})();
