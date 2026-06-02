/* ============================================================================
   TRÌNH CÀ PHÊ — main.js
   Preloader · Lenis smooth scroll · GSAP/ScrollTrigger scenes
   Guardrails: prefers-reduced-motion, mobile fallback, no console errors.
   ============================================================================ */
(function () {
  'use strict';

  const mqReduce  = window.matchMedia('(prefers-reduced-motion: reduce)');
  const prefersReduced = mqReduce.matches;
  const isDesktop = () => window.matchMedia('(min-width: 1024px)').matches;

  const hasGSAP = typeof window.gsap !== 'undefined';
  const hasST   = hasGSAP && typeof window.ScrollTrigger !== 'undefined';
  let lenis = null;

  /* ------------------------------------------------------------------
     0 · PRELOADER — show official logo + loading line, then reveal site
  ------------------------------------------------------------------ */
  function runPreloader(onDone) {
    const pre  = document.getElementById('preloader');
    if (!pre) { onDone(); return; }

    const finish = () => {
      pre.classList.add('is-done');
      document.body.classList.remove('is-loading');
      pre.style.display = 'none';
      onDone();
    };

    // Reduced motion (or no GSAP) → skip the show
    if (prefersReduced || !hasGSAP) { finish(); return; }

    document.body.classList.add('is-loading');

    // Logo + line entrance
    gsap.from('.preloader-logo', { y: 24, opacity: 0, scale: 0.94, duration: 1, ease: 'power3.out' });
    gsap.from('.preloader-line', { y: 12, opacity: 0, duration: 0.7, delay: 0.35, ease: 'power3.out' });

    // Fade out whole screen, then reveal hero content
    gsap.to(pre, {
      opacity: 0, duration: 0.8, delay: 1.4, ease: 'power2.inOut',
      onComplete: () => {
        finish();
        gsap.from('[data-hero-content]', { opacity: 0, y: 30, duration: 0.8, ease: 'power3.out' });
      },
    });
  }

  /* ------------------------------------------------------------------
     1 · LENIS smooth scroll (sync with ScrollTrigger)
  ------------------------------------------------------------------ */
  function initSmoothScroll() {
    if (prefersReduced || typeof Lenis === 'undefined') return;
    lenis = new Lenis({ duration: 1.15, smoothWheel: true, wheelMultiplier: 1, touchMultiplier: 1.4 });

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
     2 · HEADER — scrolled state + hide-on-scroll-down + active link
  ------------------------------------------------------------------ */
  function initHeader() {
    const header = document.querySelector('[data-header]');
    if (!header) return;
    let lastY = 0;
    const onScroll = () => {
      const y = window.scrollY;
      header.classList.toggle('is-scrolled', y > 30);
      // hide when scrolling down past hero, show when scrolling up
      if (y > 600 && y > lastY + 4) header.classList.add('is-hidden');
      else if (y < lastY - 4) header.classList.remove('is-hidden');
      lastY = y;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    // Mobile nav
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
      ['farm', 'roastery', 'menu', 'stores', 'footer'].forEach((id) => {
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
        if (lenis) lenis.scrollTo(target, { offset: -10 });
        else target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth' });
      });
    });
  }

  /* ------------------------------------------------------------------
     4 · REVEAL — IntersectionObserver fallback (works without GSAP)
        Adds .is-in to [data-fx] elements + staggers grouped children.
  ------------------------------------------------------------------ */
  function initReveal() {
    const items = document.querySelectorAll('[data-fx="reveal"], [data-fx="fade"], [data-fx="line"]');
    if (!items.length) return;

    if (prefersReduced || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        // stagger siblings inside a [data-reveal-group]
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
    }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
    items.forEach((el) => io.observe(el));
  }

  /* ------------------------------------------------------------------
     4b · FLUID BACKGROUND — animated coffee + butter/avocado blobs
        Soft metaball-ish drifting orbs on canvas. Light & GPU-friendly:
        pauses when tab hidden, scales count by device, respects reduce.
  ------------------------------------------------------------------ */
  function initFluid() {
    const canvas = document.querySelector('[data-fluid]');
    if (!canvas || prefersReduced) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Coffee browns + butter/avocado greens + cream
    const PALETTE = [
      [74, 44, 26],    // coffee brown
      [111, 78, 55],   // roasted bean
      [182, 255, 92],  // avocado neon (butter pop)
      [167, 216, 109], // soft avocado
      [231, 220, 200], // cream/butter
      [21, 37, 29],    // dark moss
    ];

    let w, h, dpr, blobs = [], raf = 0, running = true;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function makeBlobs() {
      const count = isDesktop() ? 8 : 5;
      blobs = [];
      for (let i = 0; i < count; i++) {
        const c = PALETTE[i % PALETTE.length];
        blobs.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: (isDesktop() ? 230 : 150) * (0.6 + Math.random() * 0.8),
          vx: (-0.5 + Math.random()) * 0.18,
          vy: (-0.5 + Math.random()) * 0.18,
          color: c,
        });
      }
    }

    function draw() {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      for (const b of blobs) {
        b.x += b.vx; b.y += b.vy;
        // wrap softly around edges
        if (b.x < -b.r) b.x = w + b.r; else if (b.x > w + b.r) b.x = -b.r;
        if (b.y < -b.r) b.y = h + b.r; else if (b.y > h + b.r) b.y = -b.r;
        const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        const [r, gr, bl] = b.color;
        g.addColorStop(0, `rgba(${r},${gr},${bl},0.42)`);
        g.addColorStop(0.6, `rgba(${r},${gr},${bl},0.12)`);
        g.addColorStop(1, `rgba(${r},${gr},${bl},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
      raf = requestAnimationFrame(draw);
    }

    resize();
    makeBlobs();
    draw();

    window.addEventListener('resize', debounce(() => { resize(); makeBlobs(); }, 200));
    // Pause when tab hidden (perf)
    document.addEventListener('visibilitychange', () => {
      running = !document.hidden;
      if (running && !raf) draw();
      if (!running) { cancelAnimationFrame(raf); raf = 0; }
    });
  }

  /* ------------------------------------------------------------------
     5 · HERO PARTICLES — floating beans with parallax depth
  ------------------------------------------------------------------ */
  function initParticles() {
    const wrap = document.querySelector('[data-particles]');
    if (!wrap || prefersReduced) return;
    const N = isDesktop() ? 14 : 6;
    const beans = [];
    for (let i = 0; i < N; i++) {
      const b = document.createElement('span');
      b.className = 'bean';
      const size = 8 + Math.random() * 26;
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
     6 · GSAP SCENES
  ------------------------------------------------------------------ */
  function initScenes(beans) {
    if (prefersReduced || !hasST) return;
    gsap.registerPlugin(ScrollTrigger);

    /* --- Hero: zoom-in parallax bg + content fade-out --- */
    const heroBg = document.querySelector('[data-hero-bg]');
    if (heroBg) {
      gsap.to(heroBg, {
        scale: 1.32, yPercent: 10, ease: 'none',
        scrollTrigger: { trigger: '[data-hero]', start: 'top top', end: 'bottom top', scrub: true },
      });
    }
    gsap.utils.toArray('[data-hero-content]').forEach((el) => {
      gsap.to(el, {
        yPercent: -14, opacity: 0, ease: 'none',
        scrollTrigger: { trigger: '[data-hero]', start: 'top top', end: 'bottom top', scrub: true },
      });
    });
    // Bean parallax tied to scroll
    if (beans) {
      beans.forEach((b) => {
        const depth = parseFloat(b.dataset.depth) || 0.3;
        gsap.to(b, {
          yPercent: depth * 120, ease: 'none',
          scrollTrigger: { trigger: '[data-hero]', start: 'top top', end: 'bottom top', scrub: true },
        });
      });
    }

    /* --- Ambient glow drift --- */
    gsap.utils.toArray('.ambient__glow').forEach((g, i) => {
      gsap.to(g, {
        yPercent: i === 0 ? 18 : -16, ease: 'none',
        scrollTrigger: { start: 'top top', end: 'bottom bottom', scrub: 1.5 },
      });
    });

    /* --- Farm: media parallax (image slower than text) --- */
    gsap.utils.toArray('[data-parallax]').forEach((el) => {
      const speed = parseFloat(el.dataset.parallax) || 0.12;
      gsap.fromTo(el, { yPercent: speed * 50 }, {
        yPercent: -speed * 50, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });

    /* --- Menu: horizontal scroll (desktop only) --- */
    const track = document.querySelector('[data-menu-track]');
    const menu = document.querySelector('[data-menu]');
    let menuST = null;
    const buildMenuScroll = () => {
      if (!track || !menu || !isDesktop()) return;
      const dist = () => track.scrollWidth - window.innerWidth + 80;
      menuST = gsap.to(track, {
        x: () => -dist(),
        ease: 'none',
        scrollTrigger: {
          trigger: menu,
          start: 'top top',
          end: () => '+=' + dist(),
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
    };
    buildMenuScroll();

    /* --- Stores: stacking cards scale-down on exit --- */
    const cards = gsap.utils.toArray('[data-stack-card]');
    cards.forEach((card, i) => {
      if (i === cards.length - 1) return;
      gsap.to(card, {
        scale: 0.93, opacity: 0.55, filter: 'brightness(0.7)', ease: 'none',
        scrollTrigger: { trigger: cards[i + 1], start: 'top bottom', end: 'top top', scrub: true },
      });
    });

    /* --- Footer giant word subtle rise --- */
    const giant = document.querySelector('.footer__giant');
    if (giant) {
      gsap.from(giant, {
        yPercent: 18, opacity: 0.2, ease: 'none',
        scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'top center', scrub: true },
      });
    }

    // Refresh after images load (widths affect horizontal scroll)
    window.addEventListener('load', () => ScrollTrigger.refresh());

    // Rebuild horizontal scroll on breakpoint change
    let wasDesktop = isDesktop();
    window.addEventListener('resize', debounce(() => {
      const nowDesktop = isDesktop();
      if (nowDesktop !== wasDesktop) {
        wasDesktop = nowDesktop;
        if (menuST && menuST.scrollTrigger) menuST.scrollTrigger.kill();
        if (menuST) menuST.kill();
        gsap.set(track, { clearProps: 'x' });
        menuST = null;
        buildMenuScroll();
        ScrollTrigger.refresh();
      }
    }, 200));
  }

  /* ------------------------------------------------------------------
     Utils
  ------------------------------------------------------------------ */
  function debounce(fn, wait) {
    let t;
    return function () { clearTimeout(t); t = setTimeout(() => fn.apply(this, arguments), wait); };
  }

  /* ------------------------------------------------------------------
     Boot
  ------------------------------------------------------------------ */
  function boot() {
    initHeader();
    initSmoothScroll();
    initAnchors();
    initReveal();
    initFluid();
    const beans = initParticles();
    runPreloader(() => initScenes(beans));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
