(function () {
  'use strict';

  var D = window.PORTFOLIO_DATA || {};
  var P = D.profile || {};
  var CFG = D.config || {};
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.documentElement.classList.add('js');

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function setText(sel, text) { var n = $(sel); if (n) n.textContent = text || ''; }
  function unique(arr) { return arr.filter(function (v, i) { return arr.indexOf(v) === i; }); }
  function plainUrl(url) { return String(url || '').replace(/^https?:\/\//, '').replace(/\/$/, ''); }

  /* ---------- Render dari data ---------- */
  function renderProfile() {
    document.title = (P.name || 'Portofolio') + ' — Portofolio & CV';
    setText('#hero-role', P.role);
    setText('#hero-name', P.name);
    setText('#hero-tagline', P.intro);
    setText('#footer-name', P.name);
    var first = String(P.name || '').trim().split(/\s+/)[0] || '';
    if (first) {
      var brand = $('#brand');
      if (brand) brand.innerHTML = '<span class="brand-prefix">Curriculum Vitae </span>' + esc(P.name) + '<span>.</span>';
      setText('#portrait-initial', first.charAt(0).toUpperCase());
    }

    var cv = $('#cv-link');
    if (cv && CFG.cvFile) cv.setAttribute('href', CFG.cvFile);

    if (CFG.photo) {
      var portrait = $('#portrait');
      var img = new Image();
      img.alt = 'Foto profil ' + (P.name || '');
      img.src = CFG.photo;
      img.onerror = function () { img.remove(); };
      portrait.appendChild(img);
    }

    var about = (P.about || []).map(function (t) { return '<p>' + esc(t) + '</p>'; }).join('');
    var interests = (P.interests || []).map(function (i) { return '<li>' + esc(i) + '</li>'; }).join('');
    $('#about-body').innerHTML =
      '<div class="about-text reveal">' + about + '</div>' +
      '<dl class="about-facts reveal">' +
        '<div><dt>Lokasi</dt><dd>' + esc(P.location) + '</dd></div>' +
        '<div><dt>Tujuan</dt><dd>' + esc(P.goal) + '</dd></div>' +
        '<div><dt>Minat</dt><dd><ul class="tags">' + interests + '</ul></dd></div>' +
      '</dl>';
  }

  function renderSkills() {
    var box = $('#skills-body');
    if (!box) return;
    box.innerHTML = '<div class="skill-grid reveal">' +
      (D.skillGroups || []).map(function (g) {
        return '<div class="skill-group"><h3>' + esc(g.category) + '</h3><ul class="tags">' +
          g.items.map(function (i) { return '<li>' + esc(i) + '</li>'; }).join('') +
          '</ul></div>';
      }).join('') +
    '</div>';
  }

  function renderEducation() {
    var box = $('#education-body');
    if (!box) return;
    box.innerHTML = '<ol class="timeline reveal">' +
      (D.education || []).map(function (ed) {
        var courses = (ed.courses && ed.courses.length)
          ? '<ul class="tags course-list">' + ed.courses.map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('') + '</ul>'
          : '';
        return '<li>' +
          '<span class="period">' + esc(ed.period) + '</span>' +
          '<h3>' + esc(ed.major) + '</h3>' +
          '<p class="org">' + esc(ed.institution) + '</p>' +
          (ed.note ? '<p class="note">' + esc(ed.note) + '</p>' : '') +
          courses +
        '</li>';
      }).join('') +
    '</ol>';
  }

  function renderProjects() {
    var grid = $('#projects-grid');
    if (!grid) return;
    grid.classList.add('reveal');
    if (!(D.projects || []).length) {
      grid.innerHTML = '<div class="empty-box reveal"><p>Proyek akan ditampilkan di sini.</p></div>';
      return;
    }
    grid.innerHTML = (D.projects || []).map(function (p, i) {
      return '<article class="card" data-cat="' + esc(p.category) + '">' +
        '<div class="card-thumb" aria-hidden="true">' +
          (p.image ? '<img src="' + esc(p.image) + '" alt="">' : '<span>' + esc(p.category) + '</span>') +
        '</div>' +
        (p.placeholder ? '<span class="badge">Contoh, ganti</span>' : '') +
        '<h3>' + esc(p.title) + '</h3>' +
        '<p>' + esc(p.summary) + '</p>' +
        '<ul class="tags">' + (p.tech || []).map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' +
        '<div class="card-actions">' +
          '<button type="button" class="text-btn" data-detail="' + i + '">Lihat detail</button>' +
          (p.demo ? '<a class="text-btn" href="' + esc(p.demo) + '" target="_blank" rel="noopener noreferrer">Demo</a>' : '') +
          (p.repo ? '<a class="text-btn" href="' + esc(p.repo) + '" target="_blank" rel="noopener noreferrer">Kode</a>' : '') +
        '</div>' +
      '</article>';
    }).join('');
  }

  function renderExperience() {
    var box = $('#experience-body');
    if (!box) return;
    box.innerHTML = '<ol class="timeline reveal">' +
      (D.experience || []).map(function (x) {
        return '<li>' +
          '<span class="period">' + esc(x.period) + '</span>' +
          '<h3>' + esc(x.role) + '</h3>' +
          '<p class="org">' + esc(x.organization) + '</p>' +
          '<ul class="bullets">' + (x.points || []).map(function (pt) { return '<li>' + esc(pt) + '</li>'; }).join('') + '</ul>' +
        '</li>';
      }).join('') +
    '</ol>';
  }

  function renderCerts() {
    var box = $('#cert-body');
    if (!box) return;
    var list = D.certifications || [];
    if (!list.length) {
      box.innerHTML = '<div class="empty-box reveal"><p>Sertifikasi dan pencapaian akan ditampilkan di sini.</p></div>';
      return;
    }
    box.innerHTML = '<div class="cert-grid reveal">' + list.map(function (c) {
      return '<article class="card">' +
        (c.thumb ? '<a class="card-thumb is-contain" href="' + esc(c.link || c.thumb) + '" target="_blank" rel="noopener noreferrer"><img src="' + esc(c.thumb) + '" alt="Pratinjau sertifikat: ' + esc(c.title) + '"></a>' : '') +
        '<h3>' + esc(c.title) + '</h3>' +
        '<p>' + esc(c.issuer) + ' · ' + esc(c.year) + '</p>' +
        (c.link ? '<a class="text-btn" href="' + esc(c.link) + '" target="_blank" rel="noopener noreferrer">Buka sertifikat (PDF)</a>' : '') +
        '</article>';
    }).join('') + '</div>';
  }

  function renderContact() {
    var list = $('#contact-list');
    if (!list) return;
    var items = ['<li><span>Email</span><a href="mailto:' + esc(P.email) + '">' + esc(P.email) + '</a></li>'];
    if (P.linkedin) items.push('<li><span>LinkedIn</span><a href="' + esc(P.linkedin) + '" target="_blank" rel="noopener noreferrer">' + esc(plainUrl(P.linkedin)) + '</a></li>');
    if (P.instagram) items.push('<li><span>Instagram</span><a href="' + esc(P.instagram) + '" target="_blank" rel="noopener noreferrer">' + esc(plainUrl(P.instagram)) + '</a></li>');
    if (P.phone) items.push('<li><span>Telepon</span><a href="tel:+62' + esc(String(P.phone).replace(/^0/, '')) + '">' + esc(P.phone) + '</a></li>');
    list.innerHTML = items.join('');
  }

  /* ---------- Tema ---------- */
  function setupTheme() {
    var root = document.documentElement;
    var btn = $('#theme-toggle');
    function current() { return root.dataset.theme === 'dark' ? 'dark' : 'light'; }
    function label() { btn.setAttribute('aria-label', current() === 'dark' ? 'Ganti ke tema terang' : 'Ganti ke tema gelap'); }
    label();
    btn.addEventListener('click', function () {
      root.classList.add('theme-anim');
      root.dataset.theme = current() === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
      label();
      setTimeout(function () { root.classList.remove('theme-anim'); }, 400);
    });
  }

  /* ---------- Menu mobile ---------- */
  function setupMenu() {
    var header = $('.site-header');
    var toggle = $('#menu-toggle');
    var nav = $('#nav-links');
    function setOpen(open) {
      header.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      $('.sr-only', toggle).textContent = open ? 'Tutup menu' : 'Buka menu';
    }
    toggle.addEventListener('click', function () {
      setOpen(!header.classList.contains('menu-open'));
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && header.classList.contains('menu-open')) {
        setOpen(false);
        toggle.focus();
      }
    });
  }

  /* ---------- Navigasi aktif ---------- */
  function setupActiveNav() {
    var links = $$('#nav-links a');
    var map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove('active'); a.removeAttribute('aria-current'); });
        var a = map[e.target.id];
        if (a) { a.classList.add('active'); a.setAttribute('aria-current', 'true'); }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) {
      var s = document.getElementById(id);
      if (s) io.observe(s);
    });
  }

  /* ---------- Animasi saat scroll ---------- */
  function setupReveal() {
    var items = $$('.reveal');
    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Progress bar, header, dan tombol kembali ke atas ---------- */
  function setupScroll() {
    var header = $('.site-header');
    var bar = $('#progress-bar');
    var toTop = $('#back-to-top');
    var ticking = false;

    function update() {
      ticking = false;
      var y = window.scrollY;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      header.classList.toggle('scrolled', y > 8);
      bar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
      toTop.classList.toggle('visible', y > 600);
    }

    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });

    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
    update();
  }

  /* ---------- Salin email ---------- */
  function flash(el, msg, ms) {
    el.textContent = msg;
    clearTimeout(el._t);
    el._t = setTimeout(function () { el.textContent = ''; }, ms || 2500);
  }

  function setupCopy() {
    var btn = $('#copy-email');
    var status = $('#copy-status');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var email = P.email || '';
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(email).then(function () {
          flash(status, 'Email disalin ke clipboard.');
        }, function () {
          flash(status, 'Gagal menyalin otomatis. Email: ' + email, 5000);
        });
      } else {
        flash(status, 'Penyalinan otomatis tidak tersedia. Email: ' + email, 5000);
      }
    });
  }

  /* ---------- Filter dan detail proyek ---------- */
  function setupProjects() {
    var filterWrap = $('#project-filter');
    var grid = $('#projects-grid');
    var count = $('#project-count');
    var dialog = $('#project-dialog');
    if (!filterWrap || !grid) return;
    if (!(D.projects || []).length) {
      filterWrap.innerHTML = '';
      count.textContent = '';
      return;
    }

    var cats = unique(['Semua'].concat((D.projects || []).map(function (p) { return p.category; })));
    filterWrap.innerHTML = cats.map(function (c, i) {
      return '<button type="button" class="chip" data-filter="' + esc(c) + '" aria-pressed="' + (i === 0) + '">' + esc(c) + '</button>';
    }).join('');

    function apply(cat) {
      var shown = 0;
      $$('.card', grid).forEach(function (card) {
        var match = cat === 'Semua' || card.dataset.cat === cat;
        card.hidden = !match;
        if (match) shown++;
      });
      $$('.chip', filterWrap).forEach(function (b) {
        b.setAttribute('aria-pressed', String(b.dataset.filter === cat));
      });
      count.textContent = shown + ' proyek ditampilkan';
    }

    function openDetail(p) {
      setText('#dlg-category', p.category);
      setText('#dlg-title', p.title);
      $('#dlg-body').innerHTML =
        '<p class="dlg-desc">' + esc(p.description) + '</p>' +
        '<ul class="tags">' + (p.tech || []).map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' +
        '<div class="dlg-links">' +
          (p.demo ? '<a class="btn btn-primary" href="' + esc(p.demo) + '" target="_blank" rel="noopener noreferrer">Buka demo</a>' : '') +
          (p.repo ? '<a class="btn btn-ghost" href="' + esc(p.repo) + '" target="_blank" rel="noopener noreferrer">Lihat kode</a>' : '') +
        '</div>';
      dialog.showModal();
    }

    filterWrap.addEventListener('click', function (e) {
      var b = e.target.closest('.chip');
      if (b) apply(b.dataset.filter);
    });

    grid.addEventListener('click', function (e) {
      var b = e.target.closest('[data-detail]');
      if (b) openDetail(D.projects[Number(b.dataset.detail)]);
    });

    $('.dialog-close', dialog).addEventListener('click', function () { dialog.close(); });
    dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });

    apply('Semua');
  }

  /* ---------- Form kontak ---------- */
  function setupForm() {
    var form = $('#contact-form');
    if (!form) return;
    var status = $('#form-status');
    var submitBtn = $('button[type="submit"]', form);

    var rules = {
      name: function (v) { return v.trim().length >= 2 ? '' : 'Nama minimal 2 karakter.'; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Masukkan alamat email yang valid, misalnya nama@email.com.'; },
      message: function (v) { return v.trim().length >= 10 ? '' : 'Pesan minimal 10 karakter.'; }
    };

    function validate(name) {
      var el = form.elements[name];
      var msg = rules[name](el.value);
      $('#e-' + name).textContent = msg;
      el.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (msg) el.setAttribute('aria-describedby', 'e-' + name);
      else el.removeAttribute('aria-describedby');
      return !msg;
    }

    Object.keys(rules).forEach(function (n) {
      var el = form.elements[n];
      el.addEventListener('blur', function () { if (el.value) validate(n); });
      el.addEventListener('input', function () { if (el.getAttribute('aria-invalid') === 'true') validate(n); });
    });

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      var results = Object.keys(rules).map(validate);
      if (results.indexOf(false) !== -1) {
        status.className = 'form-status err';
        status.textContent = 'Periksa kembali isian yang belum benar.';
        $('[aria-invalid="true"]', form).focus();
        return;
      }

      var data = {
        name: form.elements.name.value.trim(),
        email: form.elements.email.value.trim(),
        message: form.elements.message.value.trim()
      };

      // Tanpa endpoint, form tidak bisa mengirim pesan sendiri.
      // Aplikasi email dibuka dengan isi yang sudah terisi, dan statusnya ditampilkan dengan jujur.
      if (!CFG.formEndpoint) {
        var subject = encodeURIComponent('Pesan dari portofolio: ' + data.name);
        var body = encodeURIComponent('Nama: ' + data.name + '\nEmail: ' + data.email + '\n\n' + data.message);
        status.className = 'form-status';
        status.textContent = 'Belum ada layanan pengiriman form. Aplikasi email dibuka dengan pesan Anda, tetapi pesan belum terkirim sampai Anda menekan kirim di sana.';
        window.location.href = 'mailto:' + P.email + '?subject=' + subject + '&body=' + body;
        return;
      }

      submitBtn.disabled = true;
      status.className = 'form-status';
      status.textContent = 'Mengirim pesan…';
      try {
        var res = await fetch(CFG.formEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        form.reset();
        status.className = 'form-status ok';
        status.textContent = 'Pesan berhasil dikirim. Terima kasih, saya akan membalas secepatnya.';
      } catch (err) {
        status.className = 'form-status err';
        status.textContent = 'Pesan belum terkirim (' + err.message + '). Coba lagi atau hubungi saya langsung lewat email.';
      } finally {
        submitBtn.disabled = false;
      }
    });
  }

  /* ---------- Inisialisasi ---------- */
  function init() {
    renderProfile();
    renderSkills();
    renderEducation();
    renderProjects();
    renderExperience();
    renderCerts();
    renderContact();
    setText('#year', new Date().getFullYear());

    setupTheme();
    setupMenu();
    setupCopy();
    setupProjects();
    setupForm();
    setupActiveNav();
    setupReveal();
    setupScroll();

    // Satu urutan animasi pembuka untuk hero
    $$('.hero [data-anim]').forEach(function (el, i) {
      el.style.setProperty('--d', (i * 0.12) + 's');
    });
    setTimeout(function () { $('.hero').classList.add('loaded'); }, 60);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
