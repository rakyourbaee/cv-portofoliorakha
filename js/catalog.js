(function () {
  'use strict';

  var D = window.PORTFOLIO_DATA || {};
  var CFG = D.config || {};
  var PAGE = 20;
  var $ = function (id) { return document.getElementById(id); };
  var grid = $('cat-grid');
  var views = { cv: $('view-cv'), katalog: $('view-katalog') };
  if (!grid || !views.cv || !views.katalog) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.view-tab'));
  var chips = Array.prototype.slice.call(document.querySelectorAll('#cat-chips [data-stock]'));
  var search = $('cat-search');
  var sort = $('cat-sort');
  var catWrap = $('cat-cats-wrap');
  var catList = $('cat-cats');
  var moreWrap = $('cat-more-wrap');
  var moreBtn = $('cat-more');
  var dialog = $('project-dialog');
  var items = [];
  var categories = [];
  var loaded = false;
  var current = null;
  var state = { stock: 'all', kategori: '', q: '', sort: 'nama-asc', limit: PAGE };

  var STAR = '<svg class="ico-star" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/></svg>';
  var PH_ICON = '<svg class="p-ph" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M24 6l16 8v20l-16 8-16-8V14z"/><path d="M8 14l16 8 16-8M24 22v20"/></svg>';

  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function setText(id, t) { var n = $(id); if (n) n.textContent = t; }
  function rupiah(n) { return 'Rp ' + Number(n).toLocaleString('id-ID'); }
  function pad(id) { return String(id).padStart(3, '0'); }
  function hueOf(s) {
    var h = 0;
    s = String(s);
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
    return h;
  }
  function compact(n) { return n >= 1000 ? Math.floor(n / 1000) + 'rb+' : String(n); }

  /* ---------- Pindah antara CV dan Katalog ---------- */
  var indicator = document.querySelector('.view-indicator');
  function moveIndicator() {
    var active = document.querySelector('.view-tab.active');
    if (!active || !indicator) return;
    indicator.style.width = active.offsetWidth + 'px';
    indicator.style.transform = 'translateX(' + active.offsetLeft + 'px)';
  }
  window.addEventListener('resize', moveIndicator);

  var SHOP = { produk: 1, keranjang: 1, checkout: 1 };
  var RANK = { cv: 0, katalog: 1, produk: 2, keranjang: 2, checkout: 3 };
  var ready = false;
  var waiting = [];
  var currentParam = null;

  function ensure(cb) {
    if (ready) { cb(); return; }
    waiting.push(cb);
    if (!loaded) load();
  }

  function showView(target, param) {
    var key = RANK.hasOwnProperty(target) ? target : 'cv';
    param = param || null;
    if (key === current && param === currentParam) return;
    var first = current === null;
    var prev = current;
    current = key;
    currentParam = param;
    var map = {
      cv: $('view-cv'), katalog: $('view-katalog'), produk: $('view-produk'),
      keranjang: $('view-keranjang'), checkout: $('view-checkout')
    };
    Object.keys(map).forEach(function (k) { map[k].hidden = k !== key; });
    var incoming = map[key];
    if (!first) {
      incoming.classList.remove('from-left', 'from-right');
      void incoming.offsetWidth; // mulai ulang animasi
      incoming.classList.add(RANK[key] >= RANK[prev] ? 'from-right' : 'from-left');
    }
    var tabKey = key === 'cv' ? 'cv' : 'katalog';
    document.body.dataset.view = tabKey;
    tabs.forEach(function (t) {
      var on = t.dataset.view === tabKey;
      t.classList.toggle('active', on);
      if (on) t.setAttribute('aria-current', 'page'); else t.removeAttribute('aria-current');
    });
    moveIndicator();
    if (!first) window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    if (SHOP[key]) {
      ensure(function () { if (window.Toko) window.Toko.render(key, param); });
    } else if (key === 'katalog' && !loaded) {
      load();
    }
  }

  function route() {
    var parts = location.hash.replace(/^#/, '').split('/');
    var name = parts[0];
    if (name === 'produk' && parts[1]) return showView('produk', parts[1]);
    if (name === 'keranjang' || name === 'checkout') return showView(name);
    if (name === 'katalog') return showView('katalog');
    return showView('cv');
  }

  window.Katalog = {
    items: function () { return items; },
    ensure: ensure,
    current: function () { return { name: current, param: currentParam }; }
  };

  /* ---------- Data ---------- */
  function normalize(row) {
    var harga = Number(row.harga_barang) || 0;
    var asli = Number(row.harga_asli) || 0;
    var hasDisc = asli > harga;
    return {
      id: Number(row.id_barang),
      nama: String(row.nama_barang || ''),
      deskripsi: String(row.deskripsi_barang || ''),
      harga: harga,
      hargaAsli: hasDisc ? asli : 0,
      diskon: hasDisc ? Math.round((1 - harga / asli) * 100) : 0,
      stok: Number(row.jml_barang) || 0,
      gambar: row.gambar ? String(row.gambar) : '',
      kategori: row.kategori ? String(row.kategori) : '',
      rating: Number(row.rating) || 0,
      terjual: Number(row.terjual) || 0,
      lokasi: row.lokasi ? String(row.lokasi) : '',
      gratisOngkir: !!Number(row.gratis_ongkir)
    };
  }

  function setNotice(msg, warn) {
    var n = $('cat-notice');
    n.textContent = msg || '';
    n.classList.toggle('warn', !!warn);
  }

  function useSample(msg) {
    items = (D.catalogSample || []).map(normalize);
    setNotice(msg, true);
    update();
  }

  function load() {
    loaded = true;
    grid.innerHTML = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(function () {
      return '<article class="p-card skel"><div class="p-thumb"></div><div class="p-body">' +
        '<span class="p-line w70"></span><span class="p-line w40"></span></div></article>';
    }).join('');
    if (!CFG.apiUrl) { useSample('Alamat API belum diisi di data.js. Menampilkan data contoh.'); return; }
    fetch(CFG.apiUrl, { headers: { Accept: 'application/json' } })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (j) {
        if (!j || !j.ok || !Array.isArray(j.data)) throw new Error(j && j.error ? j.error : 'format data tidak valid');
        items = j.data.map(normalize);
        setNotice('');
        update();
      })
      .catch(function (err) {
        useSample('Server PHP/database belum tersambung (' + err.message + '). Menampilkan data contoh.');
      });
  }

  function update() {
    var seen = {};
    categories = items.map(function (p) { return p.kategori; }).filter(function (k) {
      if (!k || seen[k]) return false;
      seen[k] = true;
      return true;
    });
    setText('cat-banner-sub', items.length + ' produk dari database');
    updateChipCounts();
    renderCats();
    render();
    ready = true;
    waiting.splice(0).forEach(function (fn) { fn(); });
  }

  /* ---------- Hitungan di chip dan kategori ---------- */
  function updateChipCounts() {
    var ready = items.filter(function (p) { return p.stok > 0; }).length;
    var labels = {
      all: 'Semua (' + items.length + ')',
      ready: 'Tersedia (' + ready + ')',
      empty: 'Habis (' + (items.length - ready) + ')'
    };
    chips.forEach(function (c) { c.textContent = labels[c.dataset.stock]; });
  }

  function countIn(kategori) {
    return items.filter(function (p) { return p.kategori === kategori; }).length;
  }

  /* ---------- Kategori ---------- */
  function renderCats() {
    if (!categories.length) { catWrap.hidden = true; return; }
    catWrap.hidden = false;
    var all = [{ name: 'Semua', value: '', n: items.length }].concat(categories.map(function (c) {
      return { name: c, value: c, n: countIn(c) };
    }));
    catList.innerHTML = all.map(function (c) {
      return '<button type="button" class="cat-card" data-kategori="' + esc(c.value) + '" style="--hue:' + hueOf(c.name) + '" aria-pressed="' + (state.kategori === c.value) + '">' +
        '<span class="cat-icon" aria-hidden="true">' + esc(c.name.charAt(0).toUpperCase()) + '</span>' +
        '<span class="cat-name">' + esc(c.name) + '</span>' +
        '<span class="cat-sub">' + c.n + ' produk</span></button>';
    }).join('');
  }

  /* ---------- Filter, urutan, dan render ---------- */
  function visible() {
    var q = state.q.trim().toLowerCase();
    var list = items.filter(function (p) {
      if (state.stock === 'ready' && p.stok <= 0) return false;
      if (state.stock === 'empty' && p.stok > 0) return false;
      if (state.kategori && p.kategori !== state.kategori) return false;
      return !q || p.nama.toLowerCase().indexOf(q) !== -1;
    });
    var order = {
      'nama-asc': function (a, b) { return a.nama.localeCompare(b.nama, 'id'); },
      'nama-desc': function (a, b) { return b.nama.localeCompare(a.nama, 'id'); },
      'harga-asc': function (a, b) { return a.harga - b.harga; },
      'harga-desc': function (a, b) { return b.harga - a.harga; }
    }[state.sort];
    return list.sort(order);
  }

  function card(p, i) {
    var ready = p.stok > 0;
    var thumb =
      (p.gambar
        ? '<img src="' + esc(p.gambar) + '" alt="" loading="lazy">'
        : PH_ICON) +
      (p.diskon ? '<span class="p-disc">-' + p.diskon + '%</span>' : '') +
      (p.gratisOngkir ? '<span class="p-promo">Gratis Ongkir</span>' : '') +
      (ready ? '' : '<span class="p-sold">Stok habis</span>');
    var meta = [];
    if (p.rating) meta.push('<span class="p-star" aria-hidden="true">' + STAR + '</span> ' + p.rating.toFixed(1));
    if (p.terjual) meta.push(compact(p.terjual) + ' terjual');
    return '<article class="p-card" tabindex="0" role="button" data-id="' + esc(p.id) + '" style="--i:' + (i % 20) + ';--hue:' + hueOf(p.id + p.nama) + '" aria-label="Lihat detail ' + esc(p.nama) + '">' +
      '<div class="p-thumb">' + thumb + '</div>' +
      '<div class="p-body">' +
        '<h3 class="p-name">' + esc(p.nama) + '</h3>' +
        '<div class="p-pricebox"><span class="p-price' + (p.hargaAsli ? ' is-disc' : '') + '">' + rupiah(p.harga) + '</span>' +
        (p.hargaAsli ? '<span class="p-strike">' + rupiah(p.hargaAsli) + '</span>' : '') + '</div>' +
        (meta.length ? '<p class="p-meta">' + meta.join(' · ') + '</p>' : '') +
        (p.lokasi ? '<p class="p-loc">' + esc(p.lokasi) + '</p>' : '') +
      '</div></article>';
  }

  function render() {
    var list = visible();
    var shown = list.slice(0, state.limit);
    setText('cat-count', 'Menampilkan ' + shown.length + ' dari ' + list.length + ' produk');
    if (!items.length) { grid.innerHTML = '<div class="cat-empty"><p>Belum ada produk di database.</p></div>'; moreWrap.hidden = true; return; }
    if (!list.length) { grid.innerHTML = '<div class="cat-empty"><p>Tidak ada produk yang cocok dengan pencarian atau filter ini.</p></div>'; moreWrap.hidden = true; return; }
    grid.innerHTML = shown.map(card).join('');
    var sisa = list.length - shown.length;
    moreWrap.hidden = sisa <= 0;
    if (sisa > 0) moreBtn.textContent = 'Muat ' + Math.min(PAGE, sisa) + ' produk lagi';
  }

  // Setiap perubahan filter mengembalikan daftar ke halaman pertama
  function reset() { state.limit = PAGE; render(); }

  /* ---------- Detail produk ---------- */
  function openDetail(p) {
    setText('dlg-category', (p.kategori || 'Produk') + ' · ID ' + pad(p.id));
    setText('dlg-title', p.nama);
    $('dlg-body').innerHTML =
      (p.gambar ? '<img class="dlg-img" src="' + esc(p.gambar) + '" alt="' + esc(p.nama) + '">' : '') +
      '<p class="dlg-desc">' + esc(p.deskripsi || 'Belum ada deskripsi.') + '</p>' +
      '<div class="dlg-stats">' +
        '<div><span class="dlg-label">Harga</span><span class="dlg-price">' + rupiah(p.harga) + '</span>' +
        (p.hargaAsli ? ' <span class="p-strike">' + rupiah(p.hargaAsli) + '</span>' : '') + '</div>' +
        '<div><span class="dlg-label">Stok</span><span class="dlg-stock ' + (p.stok > 0 ? 'is-ready' : 'is-empty') + '">' + p.stok + ' unit</span></div>' +
        (p.rating ? '<div><span class="dlg-label">Rating</span><span class="dlg-val">' + STAR + ' ' + p.rating.toFixed(1) + '</span></div>' : '') +
        (p.lokasi ? '<div><span class="dlg-label">Dikirim dari</span><span class="dlg-val">' + esc(p.lokasi) + '</span></div>' : '') +
      '</div>';
    dialog.showModal();
  }

  function findItem(id) {
    return items.filter(function (x) { return String(x.id) === String(id); })[0];
  }

  /* ---------- Interaksi ---------- */
  catList.addEventListener('click', function (e) {
    var b = e.target.closest('[data-kategori]');
    if (!b) return;
    state.kategori = b.dataset.kategori;
    renderCats();
    reset();
  });

  Array.prototype.forEach.call(catWrap.querySelectorAll('.cat-arrow'), function (b) {
    b.addEventListener('click', function () {
      catList.scrollBy({ left: Number(b.dataset.dir) * 280, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });

  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      state.stock = c.dataset.stock;
      chips.forEach(function (x) { x.setAttribute('aria-pressed', String(x === c)); });
      reset();
    });
  });

  search.addEventListener('input', function () { state.q = search.value; reset(); });
  sort.addEventListener('change', function () { state.sort = sort.value; reset(); });

  moreBtn.addEventListener('click', function () {
    state.limit += PAGE;
    render();
  });

  $('cat-see-all').addEventListener('click', function () {
    state = { stock: 'all', kategori: '', q: '', sort: 'nama-asc', limit: PAGE };
    search.value = '';
    sort.value = 'nama-asc';
    chips.forEach(function (x) { x.setAttribute('aria-pressed', String(x.dataset.stock === 'all')); });
    renderCats();
    render();
    $('cat-head-anchor').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  });

  grid.addEventListener('click', function (e) {
    var c = e.target.closest('.p-card');
    if (!c || c.classList.contains('skel')) return;
    var p = findItem(c.dataset.id);
    if (p) location.hash = 'produk/' + p.id;
  });
  grid.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;
    var c = e.target.closest && e.target.closest('.p-card');
    if (!c || c.classList.contains('skel')) return;
    var p = findItem(c.dataset.id);
    if (p) location.hash = 'produk/' + p.id;
  });

  var closeBtn = dialog && dialog.querySelector('.dialog-close');
  if (closeBtn) closeBtn.addEventListener('click', function () { dialog.close(); });
  if (dialog) dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });

  // Bayangan header katalog saat sudah di-scroll
  var sticky = document.querySelector('.cat-sticky');
  window.addEventListener('scroll', function () {
    if (sticky) sticky.classList.toggle('is-stuck', window.scrollY > 120);
  }, { passive: true });

  // Gambar produk fade-in setelah dimuat
  grid.addEventListener('load', function (e) {
    if (e.target.tagName === 'IMG') e.target.classList.add('is-loaded');
  }, true);

  window.addEventListener('hashchange', route);
  route();
})();
