(function () {
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('a[data-wa]').forEach(function (el) {
      var msg =
        typeof el.dataset.waMsg === 'string' && el.dataset.waMsg.length
          ? el.dataset.waMsg
          : 'Hi ' +
            SHOP_CONFIG.name +
            ', I saw your Frames & Gift shop website and wanted to enquire.';
      el.href = whatsappHref(msg);
      el.rel = 'noopener noreferrer';
      el.target = '_blank';
    });

    document.querySelectorAll('a[data-tel]').forEach(function (el) {
      el.href = telHref();
      var t = (el.textContent || '').trim();
      if (!t) el.textContent = SHOP_CONFIG.phoneDisplay;
    });

    document.querySelectorAll('iframe[data-maps]').forEach(function (el) {
      el.src = SHOP_CONFIG.mapsEmbedSrc;
    });

    document.querySelectorAll('[data-bind-address]').forEach(function (el) {
      el.textContent = SHOP_CONFIG.addressLines.join(', ');
    });
  });
})();
