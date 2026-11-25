(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const header = $('#header');
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 18);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const menu = $('#mobileMenu');
  const menuToggle = $('#menuToggle');
  const closeMenu = () => {
    if (!menu || !menuToggle) return;
    menu.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
  };
  if (menuToggle && menu) {
    menuToggle.addEventListener('click', () => {
      const open = menu.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', String(open));
    });
    $$('a, button', menu).forEach((el) => el.addEventListener('click', () => {
      if (!el.matches('[data-open-demo]')) closeMenu();
    }));
  }

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealEls = $$('[data-reveal]');
  if (!reduce && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-in'));
  }

  const tabs = $$('.tab');
  const panels = $$('[data-panel]');
  const activate = (key, focus = false) => {
    tabs.forEach((tab) => {
      const on = tab.dataset.tab === key;
      tab.classList.toggle('is-active', on);
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
      if (on && focus) tab.focus();
    });
    panels.forEach((panel) => {
      const on = panel.dataset.panel === key;
      panel.classList.toggle('is-active', on);
      panel.hidden = !on;
    });
  };
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => activate(tab.dataset.tab));
    tab.addEventListener('keydown', (e) => {
      const idx = tabs.indexOf(tab);
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      const next = tabs[(idx + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      activate(next.dataset.tab, true);
    });
  });

  const indTabs = $$('.ind-tab');
  const indPanels = $$('[data-ind-panel]');
  const activateInd = (key, focus = false) => {
    indTabs.forEach((tab) => {
      const on = tab.dataset.ind === key;
      tab.classList.toggle('is-active', on);
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
      if (on && focus) tab.focus();
    });
    indPanels.forEach((panel) => {
      const on = panel.dataset.indPanel === key;
      panel.classList.toggle('is-active', on);
      panel.hidden = !on;
    });
  };
  indTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      activateInd(tab.dataset.ind);
      if (window.matchMedia('(max-width: 900px)').matches) {
        const panelBox = document.querySelector('.industry-panels');
        if (panelBox) {
          const rect = panelBox.getBoundingClientRect();
          if (rect.top > window.innerHeight * 0.7) {
            panelBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }
    });
    tab.addEventListener('keydown', (e) => {
      const idx = indTabs.indexOf(tab);
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      const next = indTabs[(idx + (e.key === 'ArrowRight' ? 1 : indTabs.length - 1)) % indTabs.length];
      activateInd(next.dataset.ind, true);
    });
  });

  const modal = $('#demoModal');
  const template = $('#demoTemplate');
  const demoBase = template ? template.textContent.trim() : '';
  let lastFocus = null;
  const openModal = (industry) => {
    if (!modal) return;
    if (template && demoBase) {
      template.textContent = industry
        ? demoBase.replace('所属行业是 ___', '所属行业是 ' + industry)
        : demoBase;
    }
    lastFocus = document.activeElement;
    modal.hidden = false;
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    const focusTarget = $('.modal-card button');
    if (focusTarget) focusTarget.focus();
  };
  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  };
  $$('[data-open-demo]').forEach((btn) => btn.addEventListener('click', () => openModal(btn.dataset.industry)));
  $$('[data-close-demo]').forEach((btn) => btn.addEventListener('click', closeModal));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && !modal.hidden) closeModal();
  });

  const copyBtn = $('#copyDemo');
  if (copyBtn && template) {
    copyBtn.addEventListener('click', async () => {
      const text = template.textContent.trim();
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const range = document.createRange();
        range.selectNodeContents(template);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        try { document.execCommand('copy'); } catch {}
        sel.removeAllRanges();
      }
      const old = copyBtn.textContent;
      copyBtn.textContent = '已复制';
      setTimeout(() => { copyBtn.textContent = old; }, 1800);
    });
  }

  const year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
