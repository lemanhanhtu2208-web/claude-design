/* ============================================================================
   TRÌNH CÀ PHÊ — main.js
   Preloader · Lenis smooth scroll · light header · reveals · hero motion
   Guardrails: prefers-reduced-motion, mobile-friendly, no console errors.
   ============================================================================ */
(function () {
  'use strict';

  const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const prefersReduced = mqReduce.matches;
  const isDesktop = () => window.matchMedia('(min-width: 1024px)').matches;

  const hasGSAP = typeof window.gsap !== 'undefined';
  const hasST = hasGSAP && typeof window.ScrollTrigger !== 'undefined';
  let lenis = null;

  /* ------------------------------------------------------------------
     0 · PRELOADER
  ------------------------------------------------------------------ */
  function runPreloader(onDone) {
    const pre = document.getElementById('preloader');
    if (!pre) { onDone(); return; }

    const finish = () => {
      pre.classList.add('is-done');
      document.body.classList.remove('is-loading');
      pre.style.display = 'none';
      onDone();
    };

    if (prefersReduced || !hasGSAP) { finish(); return; }

    document.body.classList.add('is-loading');
    gsap.from('.preloader-logo', { y: 24, opacity: 0, scale: 0.94, duration: 1, ease: 'power3.out' });
    gsap.from('.preloader-line', { y: 12, opacity: 0, duration: 0.7, delay: 0.35, ease: 'power3.out' });
    gsap.to(pre, {
      opacity: 0, duration: 0.8, delay: 1.4, ease: 'power2.inOut',
      onComplete: () => {
        finish();
        gsap.from('[data-hero-content]', { opacity: 0, y: 30, duration: 0.8, ease: 'power3.out' });
      },
    });
  }

  /* ------------------------------------------------------------------
     1 · LENIS smooth scroll
  ------------------------------------------------------------------ */
  function initSmoothScroll() {
    if (prefersReduced || typeof Lenis === 'undefined') return;
    lenis = new Lenis({ duration: 1.1, smoothWheel: true, wheelMultiplier: 1, touchMultiplier: 1.4 });

    if (hasST) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }

  /* ------------------------------------------------------------------
     2 · HEADER — light bar after hero + hide-on-scroll-down + active link
  ------------------------------------------------------------------ */
  function initHeader() {
    const header = document.querySelector('[data-header]');
    if (!header) return;
    let lastY = 0;
    // Switch to solid light bar once we leave the hero
    const trigger = () => Math.min(window.innerHeight * 0.7, 560);

    const onScroll = () => {
      const y = window.scrollY;
      header.classList.toggle('is-scrolled', y > trigger());
      if (y > 600 && y > lastY + 4) header.classList.add('is-hidden');
      else if (y < lastY - 4) header.classList.remove('is-hidden');
      lastY = y;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    // Mobile nav toggle
    const toggle = document.getElementById('navToggle');
    const nav = document.getElementById('mobileNav');
    if (toggle && nav) {
      const close = () => { nav.hidden = true; toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', 'Mở menu'); };
      toggle.addEventListener('click', () => {
        const willOpen = nav.hidden;
        nav.hidden = !willOpen;
        toggle.setAttribute('aria-expanded', String(willOpen));
        toggle.setAttribute('aria-label', willOpen ? 'Đóng menu' : 'Mở menu');
      });
      nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', close));
    }

    // Active link via section observation
    const links = [...document.querySelectorAll('.nav-link')];
    const map = new Map(links.map((l) => [l.getAttribute('href').slice(1), l]));
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            links.forEach((l) => l.classList.remove('is-active'));
            const active = map.get(e.target.id);
            if (active) active.classList.add('is-active');
          }
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      ['about', 'farm', 'products', 'menu', 'stores', 'news'].forEach((id) => {
        const el = document.getElementById(id);
        if (el) io.observe(el);
      });
    }
  }

  /* ------------------------------------------------------------------
     3 · ANCHORS — route through Lenis
  ------------------------------------------------------------------ */
  function initAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        const id = link.getAttribute('href');
        if (id.length < 2) return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        if (lenis) lenis.scrollTo(target, { offset: -70 });
        else target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth' });
      });
    });
  }

  /* ------------------------------------------------------------------
     4 · REVEAL — IntersectionObserver (works without GSAP)
  ------------------------------------------------------------------ */
  function initReveal() {
    const items = document.querySelectorAll('[data-fx="reveal"], [data-fx="fade"]');
    if (!items.length) return;

    if (prefersReduced || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const group = el.closest('[data-reveal-group]');
        if (group) {
          const sibs = [...group.querySelectorAll('[data-fx]')];
          const idx = sibs.indexOf(el);
          setTimeout(() => el.classList.add('is-in'), Math.max(0, idx) * 70);
        } else {
          el.classList.add('is-in');
        }
        io.unobserve(el);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
    items.forEach((el) => io.observe(el));
  }

  /* ------------------------------------------------------------------
     5 · HERO PARTICLES — a few floating beans (dark hero only)
  ------------------------------------------------------------------ */
  function initParticles() {
    const wrap = document.querySelector('[data-particles]');
    if (!wrap || prefersReduced) return [];
    const N = isDesktop() ? 10 : 5;
    const beans = [];
    for (let i = 0; i < N; i++) {
      const b = document.createElement('span');
      b.className = 'bean';
      const size = 8 + Math.random() * 22;
      b.style.width = size + 'px';
      b.style.height = size * 1.15 + 'px';
      b.style.left = Math.random() * 100 + '%';
      b.style.top = Math.random() * 100 + '%';
      b.dataset.depth = (0.15 + Math.random() * 0.5).toFixed(2);
      wrap.appendChild(b);
      beans.push(b);
    }
    if (hasGSAP) {
      beans.forEach((b) => {
        gsap.to(b, {
          y: '+=' + (20 + Math.random() * 40),
          x: '+=' + (-15 + Math.random() * 30),
          rotation: -20 + Math.random() * 40,
          duration: 6 + Math.random() * 6,
          repeat: -1, yoyo: true, ease: 'sine.inOut',
        });
      });
    }
    return beans;
  }

  /* ------------------------------------------------------------------
     6 · GSAP SCENES — hero parallax (subtle)
  ------------------------------------------------------------------ */
  function initScenes(beans) {
    if (prefersReduced || !hasST) return;
    gsap.registerPlugin(ScrollTrigger);

    const heroBg = document.querySelector('[data-hero-bg]');
    if (heroBg) {
      gsap.to(heroBg, {
        scale: 1.28, yPercent: 8, ease: 'none',
        scrollTrigger: { trigger: '[data-hero]', start: 'top top', end: 'bottom top', scrub: true },
      });
    }
    gsap.utils.toArray('[data-hero-content]').forEach((el) => {
      gsap.to(el, {
        yPercent: -10, opacity: 0, ease: 'none',
        scrollTrigger: { trigger: '[data-hero]', start: 'top top', end: 'bottom top', scrub: true },
      });
    });
    if (beans && beans.length) {
      beans.forEach((b) => {
        const depth = parseFloat(b.dataset.depth) || 0.3;
        gsap.to(b, {
          yPercent: depth * 110, ease: 'none',
          scrollTrigger: { trigger: '[data-hero]', start: 'top top', end: 'bottom top', scrub: true },
        });
      });
    }

    window.addEventListener('load', () => ScrollTrigger.refresh());
  }

  /* ------------------------------------------------------------------
     7 · NEWSLETTER — graceful client-side handling
  ------------------------------------------------------------------ */
  function initNewsletter() {
    const form = document.querySelector('[data-newsletter]');
    if (!form) return;
    const msg = form.querySelector('[data-newsletter-msg]');
    const input = form.querySelector('input[type="email"]');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const value = (input && input.value || '').trim();
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      if (!valid) {
        if (msg) { msg.style.color = '#C2410C'; msg.textContent = 'Vui lòng nhập email hợp lệ.'; }
        if (input) input.focus();
        return;
      }
      if (msg) { msg.style.color = ''; msg.textContent = 'Cảm ơn bạn! Trình sẽ gửi những câu chuyện cà phê tới hộp thư của bạn.'; }
      form.reset();
    });
  }

  /* ------------------------------------------------------------------
     8 · STORE TABS — lightweight filter (Tất cả / Đà Nẵng / Hội An / Stand)
  ------------------------------------------------------------------ */
  function initStoreTabs() {
    const tabs = document.querySelector('[data-store-tabs]');
    if (!tabs) return;
    const buttons = [...tabs.querySelectorAll('.store-tab')];
    const items = [...document.querySelectorAll('[data-city]')];

    tabs.addEventListener('click', (e) => {
      const btn = e.target.closest('.store-tab');
      if (!btn) return;
      const filter = btn.dataset.filter;
      buttons.forEach((b) => b.classList.toggle('is-active', b === btn));
      items.forEach((el) => {
        const show = filter === 'all' || el.dataset.city === filter;
        el.classList.toggle('is-hidden', !show);
      });
      if (hasST) ScrollTrigger.refresh();
    });
  }

  /* ------------------------------------------------------------------
     Boot
  ------------------------------------------------------------------ */
  function boot() {
    initHeader();
    initSmoothScroll();
    initAnchors();
    initReveal();
    initNewsletter();
    initStoreTabs();
    const beans = initParticles();
    runPreloader(() => initScenes(beans));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
