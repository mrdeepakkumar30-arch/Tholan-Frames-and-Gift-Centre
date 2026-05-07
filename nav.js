(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var toggle = document.querySelector('[data-nav-toggle]');
    var navLinks = document.querySelector('[data-nav-links]');

    function close() {
      if (navLinks) navLinks.classList.remove('is-open');
    }

    if (toggle && navLinks) {
      toggle.addEventListener('click', function () {
        navLinks.classList.toggle('is-open');
      });
      navLinks.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', close);
      });
    }

    var path = (location.pathname || '').split(/[/\\]/).pop() || 'index.html';
    document.querySelectorAll('[data-nav-root] a[data-page]').forEach(function (link) {
      var page = link.getAttribute('data-page');
      var hrefFile = link.getAttribute('href') || '';
      if (hrefFile === path || (path === '' && hrefFile === 'index.html'))
        link.setAttribute('aria-current', 'page');
    });

    /** Year in footer elements */
    document.querySelectorAll('[data-year]').forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });
  });
})();
