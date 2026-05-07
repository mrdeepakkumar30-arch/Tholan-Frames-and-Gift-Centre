(function () {
  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  }

  function escapeAttr(s) {
    return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  }

  document.addEventListener('DOMContentLoaded', function () {
    var holder = document.querySelector('[data-home-featured]');
    if (!holder) return;

    var items = CatalogStore.getCatalog().slice(0, 4);

    holder.innerHTML = '';

    items.forEach(function (p) {
      var figure = document.createElement('figure');
      figure.className = 'featured-tile';

      figure.innerHTML =
        '<a href="gallery.html" class="featured-link">' +
        '<img src="' +
        escapeAttr(p.imageSrc) +
        '" alt="" loading="lazy">' +
        '<figcaption>' +
        '<span class="featured-title">' +
        escapeHtml(p.title) +
        '</span>' +
        '<span class="featured-meta muted">₹' +
        p.price.toFixed(2) +
        ' · ' +
        escapeHtml(p.category) +
        '</span>' +
        '</figcaption>' +
        '</a>';

      holder.appendChild(figure);
    });
  });
})();
