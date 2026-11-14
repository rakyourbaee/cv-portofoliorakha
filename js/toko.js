(function () {
  'use strict';

  var D = window.PORTFOLIO_DATA || {};
  var CFG = D.config || {};
  var SHIP = Number(CFG.shippingCost) || 0;
  var KEY = 'cv-keranjang';
  var ORDERS = 'cv-pesanan';
  var $ = function (id) { return document.getElementById(id); };

  var STAR = '<svg class="ico-star" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/></svg>';
  var PH = '<svg class="p-ph" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><path d="M24 6l16 8v20l-16 8-16-8V14z"/><path d="M8 14l16 8 16-8M24 22v20"/></svg>';

  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function rupiah(n) { return 'Rp ' + Number(n).toLocaleString('id-ID'); }
  function pad(n, len) { return String(n).padStart(len || 3, '0'); }
  function compact(n) { return n >= 1000 ? Math.floor(n / 1000) + 'rb+' : String(n); }
  function hueOf(s) {
    var h = 0;
    s = String(s);
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
    return h;
  }
  function find(id) {
    var list = window.Katalog ? window.Katalog.items() : [];
    return list.filter(function (p) { return String(p.id) === String(id); })[0];
  }

  /* ---------- Keranjang (disimpan di browser) ---------- */
  function readCart() {
    try {
      var c = JSON.parse(localStorage.getItem(KEY) || '[]');
      return Array.isArray(c) ? c : [];
    } catch (e) { return []; }
  }
  function saveCart(c) {
    try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) {}
    badge();
  }
  function lineQty(id) {
    var l = readCart().filter(function (x) { return String(x.id) === String(id); })[0];
    return l ? Number(l.qty) : 0;
  }
  function setLine(id, qty) {
    var p = find(id);
    if (!p) return;
    qty = Math.max(0, Math.min(Number(qty) || 0, p.stok));
    var cart = readCart().filter(function (x) { return String(x.id) !== String(id); });
    if (qty > 0) cart.push({ id: Number(id), qty: qty });
    saveCart(cart);
  }
  function addLine(id, qty) { setLine(id, lineQty(id) + qty); }
  function lines() {
    return readCart().map(function (l) {
      var p = find(l.id);
      return p && p.stok > 0 ? { p: p, qty: Math.min(Number(l.qty), p.stok) } : null;
    }).filter(Boolean);
  }
  function badge() {
    var n = readCart().reduce(function (s, l) { return s + (Number(l.qty) || 0); }, 0);
    var b = $('cart-count');
    if (!b) return;
    b.hidden = n === 0;
    b.textContent = n;
  }
  function toast(msg) {
    var t = $('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._t);
    t._t = setTimeout(function () { t.classList.remove('show'); }, 2200);
  }

  /* ---------- Komponen bersama ---------- */
  function stepper(qty, max, id) {
    return '<div class="qty"' + (id ? ' data-id="' + id + '"' : '') + '>' +
      '<button type="button" class="qty-btn" data-step="-1" aria-label="Kurangi jumlah"' + (qty <= 1 ? ' disabled' : '') + '>−</button>' +
      '<span class="qty-val" aria-live="polite">' + qty + '</span>' +
      '<button type="button" class="qty-btn" data-step="1" aria-label="Tambah jumlah"' + (qty >= max ? ' disabled' : '') + '>+</button>' +
      '</div>';
  }
  function emptyBox(title, text, href, label) {
    return '<div class="empty-page"><h1>' + esc(title) + '</h1><p>' + esc(text) + '</p>' +
      '<a class="btn-buy" href="' + href + '">' + esc(label) + '</a></div>';
  }
  function breadcrumb(parts) {
    return '<nav class="crumb" aria-label="Breadcrumb"><ol>' + parts.map(function (p, i) {
      var last = i === parts.length - 1;
      return '<li>' + (last ? '<span aria-current="page">' + esc(p.label) + '</span>' : '<a href="' + p.href + '">' + esc(p.label) + '</a>') + '</li>';
    }).join('') + '</ol></nav>';
  }
  function steps(active) {
    var names = ['Keranjang', 'Data & pembayaran', 'Selesai'];
    return '<ol class="steps" aria-label="Langkah checkout">' + names.map(function (n, i) {
      var cls = i < active ? 'is-done' : (i === active ? 'is-active' : '');
      return (i ? '<li class="step-line" aria-hidden="true"></li>' : '') +
        '<li class="step ' + cls + '"><span class="step-dot">' + (i < active ? '✓' : i + 1) + '</span>' + esc(n) + '</li>';
    }).join('') + '</ol>';
  }

  /* ---------- Halaman detail produk ---------- */
  function detailPanel(p, tab) {
    if (tab === 'info') {
      return '<dl class="pd-info-list">' +
        '<div><dt>ID barang</dt><dd>' + pad(p.id) + '</dd></div>' +
        '<div><dt>Stok</dt><dd>' + p.stok + ' unit</dd></div>' +
        (p.kategori ? '<div><dt>Kategori</dt><dd>' + esc(p.kategori) + '</dd></div>' : '') +
        (p.lokasi ? '<div><dt>Dikirim dari</dt><dd>' + esc(p.lokasi) + '</dd></div>' : '') +
        '</dl>';
    }
    return esc(p.deskripsi || 'Belum ada deskripsi untuk produk ini.');
  }

  function renderProduk(id) {
    var box = $('view-produk');
    var p = find(id);
    if (!p) {
      box.innerHTML = emptyBox('Produk tidak ditemukan', 'Produk ini mungkin sudah dihapus dari database.', '#katalog', 'Kembali ke katalog');
      return;
    }
    var max = p.stok;
    var q = max > 0 ? 1 : 0;
    box.innerHTML =
      breadcrumb([{ label: 'Katalog', href: '#katalog' }, { label: p.nama }]) +
      '<div class="pd-grid">' +
        '<div class="pd-media" style="--hue:' + hueOf(p.id + p.nama) + '">' +
          (p.gambar ? '<img src="' + esc(p.gambar) + '" alt="' + esc(p.nama) + '">' : PH) +
          (p.diskon ? '<span class="pd-disc-badge">-' + p.diskon + '%</span>' : '') +
          (max === 0 ? '<span class="p-sold">Stok habis</span>' : '') +
        '</div>' +
        '<div class="pd-info">' +
          '<h1 class="pd-title">' + esc(p.nama) + '</h1>' +
          '<div class="pd-meta">' +
            (p.terjual ? '<span>Terjual ' + compact(p.terjual) + '</span>' : '') +
            (p.rating ? '<span class="pd-rating">' + STAR + ' ' + p.rating.toFixed(1) + '</span>' : '') +
          '</div>' +
          '<div class="pd-price"><span class="pd-now' + (p.hargaAsli ? ' is-disc' : '') + '">' + rupiah(p.harga) + '</span>' +
            (p.hargaAsli ? '<span class="pd-strike">' + rupiah(p.hargaAsli) + '</span>' : '') + '</div>' +
          '<div class="pd-tabs" role="tablist">' +
            '<button type="button" class="pd-tab" role="tab" data-tab="detail" aria-selected="true">Detail Produk</button>' +
            '<button type="button" class="pd-tab" role="tab" data-tab="info" aria-selected="false">Info Penting</button>' +
          '</div>' +
          '<div class="pd-panel" role="tabpanel">' + detailPanel(p, 'detail') + '</div>' +
          '<div class="pd-ship"><h3>Pengiriman</h3>' +
            (p.lokasi ? '<p>Dikirim dari <b>' + esc(p.lokasi) + '</b></p>' : '') +
            '<p>Ongkir <b>' + (SHIP ? rupiah(SHIP) : 'hubungi penjual') + '</b></p>' +
            (p.gratisOngkir ? '<p class="pd-free">Gratis ongkir</p>' : '') +
          '</div>' +
        '</div>' +
        '<aside class="pd-buy" aria-label="Beli produk">' +
          '<h2>Atur jumlah</h2>' +
          '<div class="pd-qtyrow">' + stepper(q, max) + '<span class="pd-stock">Stok: <b>' + max + '</b></span></div>' +
          '<div class="pd-subrow"><span>Subtotal</span><span class="pd-sub">' + rupiah(q * p.harga) + '</span></div>' +
          '<button type="button" class="btn-cart pd-add"' + (max === 0 ? ' disabled' : '') + '>+ Keranjang</button>' +
          '<button type="button" class="btn-buy pd-now-btn"' + (max === 0 ? ' disabled' : '') + '>Beli Langsung</button>' +
        '</aside>' +
      '</div>';

    function sync() {
      box.querySelector('.qty-val').textContent = q;
      box.querySelector('[data-step="-1"]').disabled = q <= 1;
      box.querySelector('[data-step="1"]').disabled = q >= max;
      box.querySelector('.pd-sub').textContent = rupiah(q * p.harga);
    }

    box.onclick = function (e) {
      var t = e.target.closest('button');
      if (!t || t.disabled) return;
      if (t.dataset.step) {
        q = Math.max(1, Math.min(max, q + Number(t.dataset.step)));
        sync();
        return;
      }
      if (t.classList.contains('pd-tab')) {
        box.querySelectorAll('.pd-tab').forEach(function (b) { b.setAttribute('aria-selected', String(b === t)); });
        box.querySelector('.pd-panel').innerHTML = detailPanel(p, t.dataset.tab);
        return;
      }
      if (t.classList.contains('pd-add')) {
        addLine(p.id, q);
        toast(q + ' barang ditambahkan ke keranjang');
        return;
      }
      if (t.classList.contains('pd-now-btn')) {
        addLine(p.id, q);
        location.hash = 'checkout';
      }
    };
  }

  /* ---------- Keranjang ---------- */
  function renderKeranjang() {
    var box = $('view-keranjang');
    var list = lines();
    if (!list.length) {
      box.innerHTML = '<h1 class="page-title">Keranjang belanja</h1>' +
        emptyBox('Keranjang masih kosong', 'Pilih produk dari katalog untuk mulai belanja.', '#katalog', 'Lihat katalog');
      return;
    }
    var sub = list.reduce(function (s, l) { return s + l.p.harga * l.qty; }, 0);
    box.innerHTML = '<h1 class="page-title">Keranjang belanja</h1>' +
      '<div class="cart-grid"><div class="cart-list">' +
      list.map(function (l) {
        var p = l.p;
        return '<article class="cart-item" data-id="' + p.id + '">' +
          '<a class="cart-thumb" href="#produk/' + p.id + '" style="--hue:' + hueOf(p.id + p.nama) + '">' +
            (p.gambar ? '<img src="' + esc(p.gambar) + '" alt="">' : PH) + '</a>' +
          '<div class="cart-info"><a class="cart-name" href="#produk/' + p.id + '">' + esc(p.nama) + '</a>' +
            '<p class="cart-unit">' + rupiah(p.harga) + ' / barang</p>' + stepper(l.qty, p.stok, p.id) + '</div>' +
          '<div class="cart-right"><span class="cart-sub">' + rupiah(p.harga * l.qty) + '</span>' +
            '<button type="button" class="cart-del" data-remove="' + p.id + '" aria-label="Hapus ' + esc(p.nama) + '">Hapus</button></div>' +
          '</article>';
      }).join('') +
      '</div>' +
      '<aside class="sum-card"><h2>Ringkasan belanja</h2>' +
        '<div class="sum-row"><span>Subtotal</span><span>' + rupiah(sub) + '</span></div>' +
        '<div class="sum-row"><span>Ongkir</span><span>' + rupiah(SHIP) + '</span></div>' +
        '<div class="sum-row sum-total"><span>Total</span><span>' + rupiah(sub + SHIP) + '</span></div>' +
        '<a class="btn-buy" href="#checkout">Lanjut ke checkout</a>' +
      '</aside></div>';

    box.onclick = function (e) {
      var t = e.target.closest('button');
      if (!t || t.disabled) return;
      if (t.dataset.remove) {
        setLine(t.dataset.remove, 0);
        renderKeranjang();
        return;
      }
      if (t.dataset.step) {
        var id = t.closest('.cart-item').dataset.id;
        var q = Number(t.parentNode.querySelector('.qty-val').textContent);
        setLine(id, q + Number(t.dataset.step));
        renderKeranjang();
      }
    };
  }

  /* ---------- Checkout ---------- */
  var RULES = {
    'co-nama': [function (v) { return v.trim().length >= 3; }, 'Nama minimal 3 karakter.'],
    'co-telp': [function (v) { return /^0\d{8,12}$/.test(v.replace(/[\s-]/g, '')); }, 'Masukkan nomor telepon yang valid, diawali 0.'],
    'co-alamat': [function (v) { return v.trim().length >= 10; }, 'Alamat minimal 10 karakter.'],
    'co-kota': [function (v) { return v.trim().length >= 3; }, 'Isi nama kota.'],
    'co-pos': [function (v) { return /^\d{5}$/.test(v.trim()); }, 'Kode pos harus 5 digit.']
  };

  function check(id) {
    var el = $(id);
    var ok = RULES[id][0](el.value);
    $('e-' + id).textContent = ok ? '' : RULES[id][1];
    el.setAttribute('aria-invalid', ok ? 'false' : 'true');
    return ok;
  }

  function field(id, label, type, ac, mode) {
    var attrs = ' id="' + id + '" name="' + id + '" autocomplete="' + ac + '" aria-describedby="e-' + id + '" required';
    var input = mode === 'textarea'
      ? '<textarea' + attrs + ' rows="3"></textarea>'
      : '<input' + attrs + ' type="' + type + '"' + (mode ? ' inputmode="' + mode + '"' : '') + '>';
    return '<label>' + esc(label) + input + '<span id="e-' + id + '" class="co-error" aria-live="polite"></span></label>';
  }

  function saveOrder(o) {
    var list = [];
    try { list = JSON.parse(localStorage.getItem(ORDERS) || '[]'); } catch (e) {}
    list.push(o);
    try { localStorage.setItem(ORDERS, JSON.stringify(list)); } catch (e) {}
  }

  function confirmation(o) {
    return steps(2) +
      '<div class="co-done">' +
        '<svg class="co-check" viewBox="0 0 84 84" aria-hidden="true"><circle cx="42" cy="42" r="38"/><path d="M26 44l11 11 22-24"/></svg>' +
        '<h1 class="page-title">Pesanan dibuat</h1>' +
        '<p>Nomor pesanan <b>' + esc(o.no) + '</b></p>' +
        '<p class="co-notice">Pesanan ini hanya tersimpan di browser ini. Belum dikirim ke penjual dan pembayaran belum diproses.</p>' +
        '<div class="sum-card">' +
          '<div class="sum-row"><span>Total</span><span>' + rupiah(o.total) + '</span></div>' +
          '<div class="sum-row"><span>Pembayaran</span><span>' + (o.bayar === 'cod' ? 'Bayar di tempat' : 'Transfer bank') + '</span></div>' +
        '</div>' +
        '<a class="btn-buy" href="#katalog">Kembali ke katalog</a>' +
      '</div>';
  }

  function renderCheckout(done) {
    var box = $('view-checkout');
    if (done) {
      box.innerHTML = '<h1 class="page-title">Checkout</h1>' + confirmation(done);
      badge();
      return;
    }
    var list = lines();
    if (!list.length) {
      box.innerHTML = '<h1 class="page-title">Checkout</h1>' +
        emptyBox('Tidak ada barang untuk di-checkout', 'Tambahkan produk ke keranjang terlebih dahulu.', '#katalog', 'Lihat katalog');
      return;
    }
    var sub = list.reduce(function (s, l) { return s + l.p.harga * l.qty; }, 0);
    var total = sub + SHIP;

    box.innerHTML = '<h1 class="page-title">Checkout</h1>' + steps(1) +
      '<div class="co-grid">' +
        '<form id="co-form" class="co-form" novalidate>' +
          '<fieldset><legend>Data penerima</legend>' +
            '<div class="co-row">' + field('co-nama', 'Nama penerima', 'text', 'name') + field('co-telp', 'Nomor telepon', 'tel', 'tel', 'tel') + '</div>' +
            field('co-alamat', 'Alamat lengkap', '', 'street-address', 'textarea') +
            '<div class="co-row">' + field('co-kota', 'Kota', 'text', 'address-level2') + field('co-pos', 'Kode pos', 'text', 'postal-code', 'numeric') + '</div>' +
          '</fieldset>' +
          '<fieldset><legend>Metode pembayaran</legend>' +
            '<label class="radio"><input type="radio" name="bayar" value="transfer" checked><span>Transfer bank<small>Instruksi pembayaran diberikan setelah pesanan dibuat.</small></span></label>' +
            '<label class="radio"><input type="radio" name="bayar" value="cod"><span>Bayar di tempat (COD)<small>Bayar saat barang diterima.</small></span></label>' +
          '</fieldset>' +
          '<p class="co-notice">Checkout ini belum terhubung ke sistem pembayaran atau penjual. Pesanan hanya disimpan di browser ini.</p>' +
          '<button type="submit" class="btn-buy co-submit">Buat pesanan</button>' +
        '</form>' +
        '<aside class="sum-card"><h2>Ringkasan pesanan</h2>' +
          '<div class="sum-list">' + list.map(function (l) {
            return '<div class="sum-line"><span>' + esc(l.p.nama) + ' × ' + l.qty + '</span><span>' + rupiah(l.p.harga * l.qty) + '</span></div>';
          }).join('') + '</div>' +
          '<div class="sum-row"><span>Subtotal</span><span>' + rupiah(sub) + '</span></div>' +
          '<div class="sum-row"><span>Ongkir</span><span>' + rupiah(SHIP) + '</span></div>' +
          '<div class="sum-row sum-total"><span>Total</span><span>' + rupiah(total) + '</span></div>' +
        '</aside>' +
      '</div>';

    var form = $('co-form');
    var ids = Object.keys(RULES);
    ids.forEach(function (id) {
      var el = $(id);
      el.addEventListener('blur', function () { if (el.value) check(id); });
      el.addEventListener('input', function () { if (el.getAttribute('aria-invalid') === 'true') check(id); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var results = ids.map(function (id) { return check(id); });
      var bad = results.indexOf(false);
      if (bad !== -1) {
        $(ids[bad]).focus();
        toast('Periksa kembali data penerima.');
        return;
      }
      var d = new Date();
      var order = {
        no: 'INV' + d.getFullYear() + pad(d.getMonth() + 1, 2) + pad(d.getDate(), 2) + '-' + pad(Math.floor(Math.random() * 10000), 4),
        tanggal: d.toISOString(),
        penerima: {
          nama: $('co-nama').value.trim(),
          telp: $('co-telp').value.trim(),
          alamat: $('co-alamat').value.trim(),
          kota: $('co-kota').value.trim(),
          pos: $('co-pos').value.trim()
        },
        bayar: form.elements.bayar.value,
        items: list.map(function (l) { return { id: l.p.id, nama: l.p.nama, harga: l.p.harga, qty: l.qty }; }),
        subtotal: sub,
        ongkir: SHIP,
        total: total
      };
      saveOrder(order);
      saveCart([]);
      renderCheckout(order);
    });
  }

  /* ---------- Titik masuk dari katalog.js ---------- */
  function render(name, param) {
    if (name === 'produk') renderProduk(param);
    if (name === 'keranjang') renderKeranjang();
    if (name === 'checkout') renderCheckout();
    badge();
  }

  window.Toko = { render: render };

  function init() {
    var t = document.createElement('div');
    t.id = 'toast';
    t.className = 'toast';
    t.setAttribute('role', 'status');
    t.setAttribute('aria-live', 'polite');
    document.body.appendChild(t);
    badge();
    var c = window.Katalog && window.Katalog.current();
    if (c && (c.name === 'produk' || c.name === 'keranjang' || c.name === 'checkout')) {
      window.Katalog.ensure(function () { render(c.name, c.param); });
    }
  }
  init();
})();
