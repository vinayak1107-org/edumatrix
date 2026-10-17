/* ==========================================================================
   EduMatrix — main.js
   Shared, site-wide behavior: navbar scroll state, scroll-reveal animation,
   and the dark mode toggle. Page-specific logic (cart, wishlist, search,
   etc.) lives in its own file under assets/js/ and is loaded only on the
   pages that need it.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {
  initNavbarScrollState();
  initScrollReveal();
  initThemeToggle();
  updateCartCountBadges();
});

/**
 * Adds a subtle shadow/border to the sticky navbar once the page has
 * scrolled past the top, so it reads as "lifted" above the content.
 */
function initNavbarScrollState() {
  var navbar = document.querySelector(".em-navbar");
  if (!navbar) return;

  function updateNavbarState() {
    if (window.scrollY > 8) {
      navbar.classList.add("is-scrolled");
    } else {
      navbar.classList.remove("is-scrolled");
    }
  }

  updateNavbarState();
  window.addEventListener("scroll", updateNavbarState, { passive: true });
}

/**
 * Fades/slides elements with the `.em-reveal` class into view as the user
 * scrolls to them. Falls back to showing everything immediately if
 * IntersectionObserver isn't supported, or if the user prefers reduced
 * motion (handled primarily in CSS, this is a JS-side safety net).
 */
function initScrollReveal() {
  var targets = document.querySelectorAll(".em-reveal");
  if (!targets.length) return;

  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (!("IntersectionObserver" in window) || prefersReducedMotion) {
    targets.forEach(function (el) {
      el.classList.add("is-visible");
    });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  targets.forEach(function (el) {
    observer.observe(el);
  });
}

/**
 * Updates any element with [data-cart-count] to show the current cart
 * size (a badge on the navbar cart icon). Depends on getCartCount()
 * from storage.js, which must be loaded before this file.
 */
function updateCartCountBadges() {
  var badges = document.querySelectorAll("[data-cart-count]");
  if (!badges.length) return;
  var count = typeof getCartCount === "function" ? getCartCount() : 0;
  badges.forEach(function (badge) {
    badge.textContent = String(count);
    badge.hidden = count === 0;
  });
}

/**
 * Optional dark mode toggle. Looks for a button with
 * [data-em-theme-toggle] and, if present, wires it up to flip
 * data-theme="dark" on <html> and remember the choice in localStorage.
 * Safe to include on every page even if the toggle button isn't there.
 */
function initThemeToggle() {
  var STORAGE_KEY = "edumatrix_theme";
  var root = document.documentElement;
  var toggleButtons = document.querySelectorAll("[data-em-theme-toggle]");

  var savedTheme = localStorage.getItem(STORAGE_KEY);
  if (savedTheme === "dark") {
    root.setAttribute("data-theme", "dark");
  }

  if (!toggleButtons.length) return;

  toggleButtons.forEach(function (btn) {
    var isDark = root.getAttribute("data-theme") === "dark";
    btn.setAttribute("aria-pressed", isDark ? "true" : "false");
    if (btn.type === "checkbox") {
      btn.checked = isDark;
    }

    btn.addEventListener("click", function () {
      var wasDark = root.getAttribute("data-theme") === "dark";
      if (wasDark) {
        root.removeAttribute("data-theme");
        localStorage.setItem(STORAGE_KEY, "light");
      } else {
        root.setAttribute("data-theme", "dark");
        localStorage.setItem(STORAGE_KEY, "dark");
      }
      btn.setAttribute("aria-pressed", String(!wasDark));
      if (btn.type === "checkbox") {
        btn.checked = !wasDark;
      }
    });
  });
}
