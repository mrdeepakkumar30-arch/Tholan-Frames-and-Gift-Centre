(function () {
  const CATEGORIES = ['Photo Frames', 'Gift Items', 'Wholesale Stock'];
  const LOCAL_IMAGE_FILES = [
    'baby krishna.jpeg',
    'baby mururgan.jpeg',
    'g1.jpeg',
    'k1.jpeg',
    'K10.jpeg',
    'k2.jpeg',
    'k3.jpeg',
    'K4.jpeg',
    'k5.jpeg',
    'K6.jpeg',
    'K7.jpeg',
    'K8.jpeg',
    'K9.jpeg',
    'kk.jpeg',
    'krishna.jpeg',
    'mm.jpeg',
    'owner.jpeg',
    'shop 1.jpeg',
    'shop 2.jpeg',
  ];

  /** @typedef {{ id:string, title:string, category:string, price:number, imageSrc:string, description:string }} CatalogProduct */

  function toImageSrc(fileName) {
    return encodeURI(fileName);
  }

  function applyLocalImages(list) {
    return list.map(function (p, i) {
      var fileName = LOCAL_IMAGE_FILES[i % LOCAL_IMAGE_FILES.length];
      return Object.assign({}, p, { imageSrc: toImageSrc(fileName) });
    });
  }

  function seedCatalog() {
    /** @type {CatalogProduct[]} */
    const seeds = [];
    let n = 0;
    function add(cat, title, price, seed) {
      seeds.push({
        id: 'p-' + (++n),
        title,
        category: cat,
        price,
        imageSrc: toImageSrc(LOCAL_IMAGE_FILES[n % LOCAL_IMAGE_FILES.length]),
        description: title + ' — quality craftsmanship.',
      });
    }

    ;['Photo Frames', 'Gift Items', 'Wholesale Stock'].forEach(function (cat) {
      var base = cat === 'Photo Frames' ? 499 : cat === 'Gift Items' ? 499 : 1200;
      for (var i = 1; i <= 8; i++) {
        add(cat, cat + ' — Item ' + i, base + i * 10 + (cat === 'Wholesale Stock' ? 200 : 0), cat[0] + i);
      }
    });
    return applyLocalImages(seeds);
  }

  function loadCatalog() {
    try {
      var raw = localStorage.getItem(SHOP_CONFIG.storageCatalogKey);
      if (!raw) return seedCatalog();
      var arr = JSON.parse(raw);
      if (!Array.isArray(arr) || !arr.length) return seedCatalog();
      var normalized = normalizeCatalog(arr);
      var needsLocalImageRefresh = normalized.every(function (p) {
        return !p.imageSrc || p.imageSrc.indexOf('picsum.photos') !== -1;
      });
      return needsLocalImageRefresh ? applyLocalImages(normalized) : normalized;
    } catch (e) {
      return seedCatalog();
    }
  }

  function normalizeCatalog(arr) {
    return arr.map(function (p, i) {
      return {
        id: String(p.id || 'p-import-' + i),
        title: String(p.title || 'Product'),
        category: CATEGORIES.indexOf(p.category) >= 0 ? p.category : CATEGORIES[0],
        price: Number(p.price) || 0,
        imageSrc: String(p.imageSrc || ''),
        description: String(p.description || ''),
      };
    });
  }

  function saveCatalog(list) {
    localStorage.setItem(SHOP_CONFIG.storageCatalogKey, JSON.stringify(normalizeCatalog(list)));
  }

  /** @returns {CatalogProduct[]} */
  function getCatalog() {
    return normalizeCatalog(loadCatalog());
  }

  function getProduct(id) {
    return getCatalog().find(function (p) {
      return p.id === id;
    });
  }

  /** @param {CatalogProduct} p */
  function upsertProduct(p) {
    var list = getCatalog().slice();
    var idx = list.findIndex(function (x) {
      return x.id === p.id;
    });
    if (idx >= 0) list[idx] = normalizeCatalog([p])[0];
    else list.push(normalizeCatalog([p])[0]);
    saveCatalog(list);
    return list;
  }

  function deleteProduct(id) {
    var list = getCatalog().filter(function (x) {
      return x.id !== id;
    });
    saveCatalog(list);
    return list;
  }

  function resetToSeed() {
    saveCatalog(seedCatalog());
    return getCatalog();
  }

  function exportJson() {
    return JSON.stringify(getCatalog(), null, 2);
  }

  /** @param {string} json */
  function importJson(json) {
    var parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) throw new Error('JSON must be an array');
    saveCatalog(parsed);
    return getCatalog();
  }

  /** @returns {CatalogProduct[]} */
  function filterByCategory(category) {
    if (!category || category === 'All') return getCatalog();
    return getCatalog().filter(function (p) {
      return p.category === category;
    });
  }

  window.CatalogStore = {
    CATEGORIES: CATEGORIES,
    getCatalog: getCatalog,
    getProduct: getProduct,
    upsertProduct: upsertProduct,
    deleteProduct: deleteProduct,
    resetToSeed: resetToSeed,
    exportJson: exportJson,
    importJson: importJson,
    filterByCategory: filterByCategory,
    saveCatalog: saveCatalog,
  };
})();
