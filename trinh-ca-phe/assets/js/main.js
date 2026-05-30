/* =========================================================
   Trình Cà Phê — Scroll interactions
   Stack: GSAP + ScrollTrigger + Lenis (smooth scroll)
   UX guardrails: prefers-reduced-motion, mobile fallback,
   skip/disable scroll-jacking on small screens.
   ========================================================= */

(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isDesktop = window.matchMedia('(min-width: 768px)').matches;

  /* ---------------------------------------------------------
     0. Navbar — scrolled state + mobile drawer + active link
     (Runs always; no heavy motion.)
  --------------------------------------------------------- */
  function initNavbar() {
    const navbar = document.getElementById('navbar');
    const onScroll = () => navbar.classList.toggle('is-scrolled', window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    // Mobile drawer
    const toggle = document.getElementById('menuToggle');
    const menu = document.getElementById('mobileMenu');
    if (toggle && menu) {
      const close = () => {
        menu.hidden = true;
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Mở menu');
      };
      toggle.addEventListener('click', () => {
        const open = menu.hidden;
        menu.hidden = !open;
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Đóng menu' : 'Mở menu');
      });
      menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', close));
    }
  }

  /* ---------------------------------------------------------
     1. Lenis smooth scroll (skipped under reduced-motion)
  --------------------------------------------------------- */
  let lenis = null;
  function initSmoothScroll() {
    if (prefersReduced || typeof Lenis === 'undefined') return;
    lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);

    if (window.ScrollTrigger) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    }
  }

  /* ---------------------------------------------------------
     Anchor links — route through Lenis when available
  --------------------------------------------------------- */
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

  /* ---------------------------------------------------------
     Reveal fallback (IntersectionObserver) — always works,
     even without GSAP. Used for About section.
  --------------------------------------------------------- */
  function initReveal() {
    const items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    if (prefersReduced || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // stagger 60ms (UX: stagger-sequence)
          setTimeout(() => entry.target.classList.add('is-visible'), i * 60);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -10% 0px' });
    items.forEach((el) => io.observe(el));
  }

  /* ---------------------------------------------------------
     GSAP-powered scenes (desktop + motion allowed only)
  --------------------------------------------------------- */
  function initGsapScenes() {
    if (prefersReduced || typeof gsap === 'undefined' || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);

    /* --- Phân cảnh 1: Hero zoom-in parallax --- */
    const canopy = document.querySelector('[data-hero-canopy]');
    if (canopy) {
      gsap.to(canopy, {
        scale: 1.35, yPercent: 12, ease: 'none',
        scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true },
      });
      // Content drifts up + fades as you leave hero
      gsap.to('[data-hero-content]', {
        yPercent: -18, opacity: 0.2, ease: 'none',
        scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true },
      });
    }
    // Foreground leaf parallax (desktop only)
    document.querySelectorAll('[data-hero-leaf]').forEach((el) => {
      const depth = parseFloat(el.dataset.heroLeaf) || 0.3;
      gsap.to(el, {
        yPercent: depth * 60, ease: 'none',
        scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true },
      });
    });

    /* --- Phân cảnh 2: About parallax depth (image slower than text) --- */
    document.querySelectorAll('[data-parallax]').forEach((el) => {
      const speed = parseFloat(el.dataset.parallax) || 0.15;
      gsap.fromTo(el, { yPercent: speed * 40 }, {
        yPercent: -speed * 40, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });

    /* --- Phân cảnh 3: Menu horizontal scroll (pin + translate) --- */
    if (isDesktop) {
      const track = document.querySelector('[data-menu-track]');
      const section = document.querySelector('[data-menu-section]');
      if (track && section) {
        track.classList.add('is-pinned');
        const getScrollDist = () => track.scrollWidth - window.innerWidth + 80;
        gsap.to(track, {
          x: () => -getScrollDist(),
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () => '+=' + getScrollDist(),
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });
      }
    }

    /* --- Phân cảnh 4: Stacking cards — subtle scale on the outgoing card --- */
    const stackCards = gsap.utils.toArray('[data-stack-card]');
    stackCards.forEach((card, i) => {
      if (i === stackCards.length - 1) return; // last stays
      gsap.to(card, {
        scale: 0.94, filter: 'brightness(0.92)', ease: 'none',
        scrollTrigger: {
          trigger: stackCards[i + 1],
          start: 'top bottom',
          end: 'top top',
          scrub: true,
        },
      });
    });

    // Recalculate on full load (images affect widths)
    window.addEventListener('load', () => ScrollTrigger.refresh());
  }

  /* ---------------------------------------------------------
     Boot
  --------------------------------------------------------- */
  function boot() {
    initNavbar();
    initSmoothScroll();
    initAnchors();
    initReveal();
    initGsapScenes();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
