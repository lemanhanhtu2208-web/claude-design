/* MeliOh Bistro Da Nang — Remake Concept
   Interactions: preloader, header, mobile nav, reveal, accordion,
   parallax, form validation + Formspree submit. */

(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Preloader ---------- */
  window.addEventListener("load", function () {
    var pre = document.getElementById("preloader");
    if (!pre) return;
    setTimeout(function () { pre.classList.add("is-done"); }, 600);
  });

  /* ---------- Year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Header scroll state ---------- */
  var header = document.getElementById("header");
  function onScroll() {
    if (window.scrollY > 40) header.classList.add("is-scrolled");
    else header.classList.remove("is-scrolled");
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Mobile nav ---------- */
  var burger = document.getElementById("burger");
  var nav = document.getElementById("nav");
  function closeNav() {
    header.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
  }
  if (burger) {
    burger.addEventListener("click", function () {
      var open = header.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", String(open));
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeNav);
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !prefersReduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- Accordion ---------- */
  document.querySelectorAll(".acc").forEach(function (acc) {
    var head = acc.querySelector(".acc__head");
    var panel = acc.querySelector(".acc__panel");
    head.addEventListener("click", function () {
      var isOpen = acc.classList.contains("is-open");
      // close others
      document.querySelectorAll(".acc.is-open").forEach(function (o) {
        if (o !== acc) {
          o.classList.remove("is-open");
          o.querySelector(".acc__head").setAttribute("aria-expanded", "false");
          o.querySelector(".acc__panel").style.maxHeight = null;
        }
      });
      if (isOpen) {
        acc.classList.remove("is-open");
        head.setAttribute("aria-expanded", "false");
        panel.style.maxHeight = null;
      } else {
        acc.classList.add("is-open");
        head.setAttribute("aria-expanded", "true");
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
    });
  });

  /* ---------- Light hero parallax ---------- */
  var parallax = document.querySelector("[data-parallax]");
  if (parallax && !prefersReduced && window.innerWidth > 720) {
    window.addEventListener("scroll", function () {
      var y = window.scrollY;
      if (y < window.innerHeight) {
        parallax.style.transform = "translateY(" + (y * 0.18) + "px)";
      }
    }, { passive: true });
  }

  /* ---------- Reservation form ---------- */
  var form = document.getElementById("reservationForm");
  var statusEl = document.getElementById("formStatus");

  function setStatus(msg, type) {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.className = "form__status" + (type ? " is-" + type : "");
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // honeypot
      if (form.querySelector('[name="_gotcha"]').value) return;

      // validate required
      var valid = true;
      form.querySelectorAll("[required]").forEach(function (input) {
        var field = input.closest(".field");
        var ok = input.value.trim() !== "" && input.checkValidity();
        if (field) field.classList.toggle("is-invalid", !ok);
        if (!ok) valid = false;
      });

      if (!valid) {
        setStatus("Please complete the highlighted fields so we can reach you.", "err");
        return;
      }

      var action = form.getAttribute("action") || "";
      var notConfigured = action.indexOf("your-form-id") !== -1;

      setStatus("Sending your request…", "");

      if (notConfigured) {
        // Demo mode: no live Formspree endpoint set yet.
        setTimeout(function () {
          setStatus("Thank you. This is a concept demo — connect a Formspree ID to receive live requests. We would reply to confirm your evening.", "ok");
          form.reset();
        }, 700);
        return;
      }

      fetch(action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      }).then(function (res) {
        if (res.ok) {
          setStatus("Thank you. We have received your request and will reply soon to confirm the details.", "ok");
          form.reset();
        } else {
          setStatus("Something went wrong. Please call us at +84 0918 204 008 and we will help.", "err");
        }
      }).catch(function () {
        setStatus("Network issue. Please call us at +84 0918 204 008 and we will help.", "err");
      });
    });

    // clear invalid state on input
    form.querySelectorAll("input, select, textarea").forEach(function (el) {
      el.addEventListener("input", function () {
        var f = el.closest(".field");
        if (f) f.classList.remove("is-invalid");
      });
    });
  }

  /* ---------- Newsletter (demo) ---------- */
  var news = document.getElementById("newsletterForm");
  if (news) {
    news.addEventListener("submit", function (e) {
      var action = news.getAttribute("action") || "";
      if (action.indexOf("your-form-id") !== -1) {
        e.preventDefault();
        var input = news.querySelector("input");
        if (input.checkValidity()) {
          news.innerHTML = '<p style="color:var(--wine);font-family:var(--serif);font-size:1.2rem;">Thank you for subscribing.</p>';
        } else {
          input.reportValidity();
        }
      }
    });
  }
})();
