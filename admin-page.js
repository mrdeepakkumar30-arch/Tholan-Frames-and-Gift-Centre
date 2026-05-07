(function () {
  var SESSION_KEY = 'krishna_admin_session';

  function getStoredPin() {
    var p = localStorage.getItem(SHOP_CONFIG.storageAdminPinKey);
    if (p && p.length >= 4) return p;
    return SHOP_CONFIG.adminDefaultPin || '1234';
  }

  function isAuthenticated() {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  }

  function tryLogin(pin) {
    if (String(pin) === getStoredPin()) {
      sessionStorage.setItem(SESSION_KEY, '1');
      return true;
    }
    return false;
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
  }

  function showGate(yes) {
    var gate = document.querySelector('[data-admin-gate]');
    var app = document.querySelector('[data-admin-app]');
    if (gate) gate.hidden = !yes;
    if (app) app.hidden = yes;
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  }

  function escapeAttr(s) {
    return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  }

  function renderTable() {
    var tbody = document.querySelector('[data-admin-products]');
    if (!tbody) return;
    var list = CatalogStore.getCatalog();

    tbody.innerHTML = '';

    list.forEach(function (p) {
      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td><img src="' +
        escapeAttr(p.imageSrc) +
        '" alt="" class="admin-thumb"/></td>' +
        '<td>' +
        escapeHtml(p.title) +
        '</td>' +
        '<td>' +
        escapeHtml(p.category) +
        '</td>' +
        '<td>₹' +
        p.price.toFixed(2) +
        '</td>' +
        '<td>' +
        '<button type="button" class="btn btn-ghost btn-sm" data-edit="' +
        escapeAttr(p.id) +
        '">Edit</button> ' +
        '<button type="button" class="btn btn-danger btn-sm" data-del="' +
        escapeAttr(p.id) +
        '">Delete</button>' +
        '</td>';
      tbody.appendChild(tr);
    });
  }

  function form() {
    return document.querySelector('[data-admin-form]');
  }

  function clearFormFields(f) {
    var idInput = f.querySelector('[name=id]');
    var title = f.querySelector('[name=title]');
    var cat = f.querySelector('[name=category]');
    var price = f.querySelector('[name=price]');
    var img = f.querySelector('[name=imageSrc]');
    var desc = f.querySelector('[name=description]');
    if (idInput) idInput.value = '';
    if (title) title.value = '';
    if (cat) cat.selectedIndex = 0;
    if (price) price.value = '';
    if (img) img.value = '';
    if (desc) desc.value = '';
  }

  function populateForm(id) {
    var f = form();
    if (!f) return;

    var idInput = f.querySelector('[name=id]');
    var title = f.querySelector('[name=title]');
    var cat = f.querySelector('[name=category]');
    var price = f.querySelector('[name=price]');
    var img = f.querySelector('[name=imageSrc]');
    var desc = f.querySelector('[name=description]');

    if (!id || id === 'new') {
      clearFormFields(f);
      return;
    }

    var p = CatalogStore.getProduct(id);
    if (!p) {
      clearFormFields(f);
      return;
    }

    if (idInput) idInput.value = p.id;
    if (title) title.value = p.title;
    if (cat) cat.value = p.category;
    if (price) price.value = String(p.price);
    if (img) img.value = p.imageSrc;
    if (desc) desc.value = p.description;
  }

  function wireGate() {
    var loginBtn = document.querySelector('[data-admin-login]');
    var pinInp = document.querySelector('[data-admin-pin-input]');

    if (pinInp)
      pinInp.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter' && loginBtn) loginBtn.click();
      });

    if (loginBtn && pinInp) {
      loginBtn.addEventListener('click', function () {
        if (tryLogin(pinInp.value)) {
          showGate(false);
          renderTable();
        } else alert('Incorrect PIN.');
      });
    }

    var out = document.querySelector('[data-admin-logout]');
    if (out)
      out.addEventListener('click', function () {
        logout();
        showGate(true);
        if (pinInp) pinInp.value = '';
      });

    var chPin = document.querySelector('[data-admin-change-pin]');
    var newPinInput = document.querySelector('[data-admin-new-pin]');
    if (chPin && newPinInput) {
      chPin.addEventListener('click', function () {
        if (!isAuthenticated()) return;
        var newPin = newPinInput.value.trim();
        if (newPin.length < 4) {
          alert('PIN must be at least 4 characters.');
          return;
        }
        localStorage.setItem(SHOP_CONFIG.storageAdminPinKey, newPin);
        newPinInput.value = '';
        alert('PIN updated for this browser.');
      });
    }

    var hint = document.querySelector('[data-admin-pin-hint]');
    if (hint && isAuthenticated()) hint.textContent = '';
    if (hint && !isAuthenticated())
      hint.textContent =
        'Default PIN until you change it: ' +
        SHOP_CONFIG.adminDefaultPin +
        ' (stored per browser after login).';

    if (isAuthenticated()) showGate(false);
    else showGate(true);
  }

  function scrollToForm() {
    var el = document.querySelector('[data-admin-scroll]');
    if (el)
      el.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
  }

  function wireCrud() {
    var formEl = document.querySelector('[data-admin-form]');
    if (formEl) {
      formEl.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!isAuthenticated()) return;

        var f = formEl;
        var fd = new FormData(f);
        var rawId = fd.get('id');

        /** @type {string} */
        var idFinal =
          typeof rawId === 'string' && rawId.length
            ? rawId
            : 'p-' + String(Date.now()) + '-' + Math.random().toString(36).slice(2, 6);

        var titleStr = fd.get('title');
        /** @type {string} */
        var title =
          typeof titleStr === 'string' ? titleStr.trim() : '';

        /** @type {string} */
        var categoryRaw = fd.get('category');
        var category = CatalogStore.CATEGORIES.includes(String(categoryRaw))
          ? String(categoryRaw)
          : CatalogStore.CATEGORIES[0];

        var priceNum = Number(fd.get('price'));

        /** @type {string} */
        var imageSrc = String(fd.get('imageSrc') || '').trim();

        /** @type {string} */
        var description = String(fd.get('description') || '').trim();

        if (!title) {
          alert('Title is required.');
          return;
        }

        CatalogStore.upsertProduct({
          id: idFinal,
          title: title,
          category: category,
          price: isNaN(priceNum) ? 0 : priceNum,
          imageSrc:
            imageSrc ||
            'https://picsum.photos/seed/adm-' +
            encodeURIComponent(idFinal).slice(0, 18) +
            '/600/480',
          description: description || title,
        });

        renderTable();
        populateForm('');
        alert('Saved.');
      });
    }

    document.addEventListener('click', function (e) {
      var node = e.target;
      if (!node || typeof node.closest !== 'function') return;

      var tgt = node.closest('[data-del]');
      var edit = node.closest('[data-edit]');

      if (!tgt && !edit) return;
      if (!isAuthenticated()) return;

      if (tgt) {
        var delId = tgt.getAttribute('data-del');
        if (!delId || !confirm('Delete this product from the catalogue?')) return;
        CatalogStore.deleteProduct(delId);
        renderTable();
        return;
      }

      if (edit) {
        var eid = edit.getAttribute('data-edit');
        populateForm(eid || '');
        if (form()) scrollToForm();
      }
    });

    var addNewBtn = document.querySelector('[data-admin-new-product]');
    if (addNewBtn)
      addNewBtn.addEventListener('click', function () {
        populateForm('new');
        scrollToForm();
      });

    var resetSeed = document.querySelector('[data-admin-reset-seed]');
    if (resetSeed)
      resetSeed.addEventListener('click', function () {
        if (
          confirm(
            'Reset catalogue to seeded demo stock? Current list will be overwritten in this browser.',
          )
        ) {
          CatalogStore.resetToSeed();
          renderTable();
        }
      });

    var clearAllBtn = document.querySelector('[data-admin-clear-all]');
    if (clearAllBtn)
      clearAllBtn.addEventListener('click', function () {
        if (!confirm('Remove ALL products? Export a backup first if needed.')) return;
        CatalogStore.saveCatalog([]);
        renderTable();
      });

    var exportBtn = document.querySelector('[data-admin-export]');
    if (exportBtn)
      exportBtn.addEventListener('click', function () {
        var blob = new Blob([CatalogStore.exportJson()], { type: 'application/json;charset=utf-8' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'krishna-catalog-export.json';
        a.click();
        URL.revokeObjectURL(a.href);
      });

    var importInput = /** @type {HTMLInputElement|null} */ (
      document.querySelector('[data-admin-import-file]')
    );
    var btnImportConfirm = document.querySelector('[data-admin-import-confirm]');

    if (btnImportConfirm && importInput)
      btnImportConfirm.addEventListener('click', function () {
        var files = importInput.files;
        if (!files || !files[0]) {
          alert('Choose a JSON file first.');
          return;
        }

        var reader = new FileReader();
        reader.onload = function () {
          try {
            CatalogStore.importJson(String(reader.result));
            renderTable();
            alert('Import complete.');
          } catch (err) {
            alert('Import failed: ' + ((err && err.message) ? err.message : String(err)));
          }
        };

        reader.readAsText(files[0]);
      });
  }

  if (document.querySelector('[data-admin-app]')) {
    document.addEventListener('DOMContentLoaded', function () {
      wireGate();
      wireCrud();
      if (isAuthenticated()) renderTable();
      populateForm('');
    });
  }
})();
