(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var header = document.getElementById('header');
  var progressBar = document.getElementById('progressBar');
  var menuToggle = document.getElementById('menuToggle');
  var mobileMenu = document.getElementById('mobileMenu');
  var year = document.getElementById('year');

  if (year) year.textContent = new Date().getFullYear();

  /* header + scroll progress */
  var ticking = false;
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (header) header.classList.toggle('scrolled', y > 12);
    if (progressBar) progressBar.style.width = (max > 0 ? Math.min(100, (y / max) * 100) : 0) + '%';
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onScroll);
    }
  }, { passive: true });
  onScroll();

  /* mobile menu */
  function setMenu(open) {
    if (!menuToggle || !mobileMenu) return;
    menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuToggle.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
    mobileMenu.hidden = !open;
    document.body.classList.toggle('menu-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', function () {
      setMenu(menuToggle.getAttribute('aria-expanded') !== 'true');
    });
    mobileMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setMenu(false);
    });
    document.addEventListener('click', function (e) {
      if (mobileMenu.hidden) return;
      if (mobileMenu.contains(e.target) || menuToggle.contains(e.target)) return;
      setMenu(false);
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 980) setMenu(false);
    });
  }

  /* reveal on scroll */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
  if (!('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          revealIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(function (el) { revealIO.observe(el); });
  }

  /* animated counters */
  var counters = Array.prototype.slice.call(document.querySelectorAll('[data-count]'));
  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    if (reduced || target === 0) {
      el.textContent = String(target);
      return;
    }
    var start = null;
    var duration = 1500;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min(1, (ts - start) / duration);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    var countIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          countIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { countIO.observe(el); });
  } else {
    counters.forEach(animateCount);
  }

  /* active section nav */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-links a'));
  var sections = navLinks.map(function (a) {
    return document.querySelector(a.getAttribute('href'));
  }).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    var navIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = '#' + entry.target.id;
        navLinks.forEach(function (a) {
          a.classList.toggle('active', a.getAttribute('href') === id);
        });
      });
    }, { rootMargin: '-42% 0px -52% 0px' });
    sections.forEach(function (s) { navIO.observe(s); });
  }

  /* horizontal gallery */
  var rail = document.getElementById('rail');
  var railPrev = document.getElementById('railPrev');
  var railNext = document.getElementById('railNext');
  function railStep() {
    if (!rail) return 480;
    var card = rail.querySelector('.shot');
    return card ? card.getBoundingClientRect().width + 22 : 480;
  }
  function updateRailButtons() {
    if (!rail || !railPrev || !railNext) return;
    var max = rail.scrollWidth - rail.clientWidth - 2;
    railPrev.disabled = rail.scrollLeft <= 2;
    railNext.disabled = rail.scrollLeft >= max;
  }
  if (rail) {
    if (railPrev) railPrev.addEventListener('click', function () {
      rail.scrollBy({ left: -railStep() * 2, behavior: reduced ? 'auto' : 'smooth' });
    });
    if (railNext) railNext.addEventListener('click', function () {
      rail.scrollBy({ left: railStep() * 2, behavior: reduced ? 'auto' : 'smooth' });
    });
    var railTick = false;
    rail.addEventListener('scroll', function () {
      if (!railTick) {
        railTick = true;
        requestAnimationFrame(function () { updateRailButtons(); railTick = false; });
      }
    }, { passive: true });
    updateRailButtons();
  }

  /* lightbox */
  var dialog = document.getElementById('lightbox');
  var lbImg = document.getElementById('lbImg');
  var lbTitle = document.getElementById('lbTitle');
  var lbDesc = document.getElementById('lbDesc');
  var lbNo = document.getElementById('lbNo');
  var lbClose = document.getElementById('lbClose');
  var lbPrev = document.getElementById('lbPrev');
  var lbNext = document.getElementById('lbNext');
  var shots = Array.prototype.slice.call(document.querySelectorAll('.shot'));
  var shotIndex = 0;
  var lastTrigger = null;

  function pad(n) { return n < 10 ? '0' + n : String(n); }
  function showShot(i) {
    if (!shots.length) return;
    shotIndex = (i + shots.length) % shots.length;
    var s = shots[shotIndex];
    var title = s.getAttribute('data-title') || '';
    lbImg.src = s.getAttribute('data-full');
    lbImg.alt = title + '界面';
    lbTitle.textContent = title;
    lbDesc.textContent = s.getAttribute('data-desc') || '';
    lbNo.textContent = pad(shotIndex + 1) + ' / ' + pad(shots.length);
  }
  if (dialog && typeof dialog.showModal === 'function') {
    shots.forEach(function (s, i) {
      s.addEventListener('click', function () {
        lastTrigger = s;
        showShot(i);
        dialog.showModal();
      });
    });
    if (lbClose) lbClose.addEventListener('click', function () { dialog.close(); });
    if (lbPrev) lbPrev.addEventListener('click', function () { showShot(shotIndex - 1); });
    if (lbNext) lbNext.addEventListener('click', function () { showShot(shotIndex + 1); });
    dialog.addEventListener('click', function (e) {
      if (e.target === dialog) dialog.close();
    });
    dialog.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); showShot(shotIndex - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); showShot(shotIndex + 1); }
    });
    dialog.addEventListener('close', function () {
      lbImg.removeAttribute('src');
      if (lastTrigger) lastTrigger.focus({ preventScroll: true });
    });
  }

  /* faq accordion */
  var details = Array.prototype.slice.call(document.querySelectorAll('.faq-list details'));
  details.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (!d.open) return;
      details.forEach(function (other) {
        if (other !== d) other.open = false;
      });
    });
  });
})();
