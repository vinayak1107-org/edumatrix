/* ==========================================================================
   EduMatrix — wishlist.js
   Wires up every wishlist heart button on the page: sets its initial
   state from localStorage, and toggles + persists on click. Works for
   any number of course cards, on any page, as long as each button has
   the `.em-course-card__wishlist` class and a `data-course-id` attribute.

   Depends on: storage.js (must be loaded first)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {
  initWishlistButtons();
  updateWishlistCountBadges();
  renderWishlistPage();
});

/**
 * Finds every wishlist button currently in the DOM, sets its visual
 * state to match localStorage, and attaches a click handler. Safe to
 * call again after re-rendering a course grid (e.g. after filtering).
 */
function initWishlistButtons() {
  var buttons = document.querySelectorAll(".em-course-card__wishlist[data-course-id]");

  buttons.forEach(function (btn) {
    var courseId = btn.getAttribute("data-course-id");
    setWishlistButtonState(btn, isInWishlist(courseId));

    // Avoid attaching duplicate listeners if this runs more than once.
    if (btn.dataset.emWishlistBound === "true") return;
    btn.dataset.emWishlistBound = "true";

    btn.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      var isNowActive = toggleWishlist(courseId);
      setWishlistButtonState(btn, isNowActive);
      updateWishlistCountBadges();
      showToast(
        isNowActive ? "Added to wishlist" : "Removed from wishlist"
      );
      document.dispatchEvent(new CustomEvent("em:wishlist-changed", {
        detail: { courseId: Number(courseId), isActive: isNowActive }
      }));
    });
  });
}

/**
 * @param {HTMLElement} btn
 * @param {boolean} isActive
 */
function setWishlistButtonState(btn, isActive) {
  btn.classList.toggle("is-active", isActive);
  btn.setAttribute("aria-pressed", String(isActive));
  var icon = btn.querySelector(".material-symbols-outlined");
  if (icon) {
    icon.classList.toggle("icon-fill", isActive);
  }
}

/**
 * Updates any element with [data-wishlist-count] to show the current
 * wishlist size (e.g. a badge on a navbar wishlist icon).
 */
function updateWishlistCountBadges() {
  var badges = document.querySelectorAll("[data-wishlist-count]");
  if (!badges.length) return;
  var count = getWishlistCount();
  badges.forEach(function (badge) {
    badge.textContent = String(count);
    badge.hidden = count === 0;
  });
}

/**
 * Renders wishlist.html's course grid, if that element exists on the
 * current page. Re-renders whenever a wishlist button anywhere fires
 * em:wishlist-changed, so removing an item updates the grid instantly.
 * Depends on: courses-data.js (getCourseById, renderCourseCardHTML)
 */
function renderWishlistPage() {
  var grid = document.getElementById("wishlistGrid");
  if (!grid) return;

  if (!document.body.dataset.emWishlistPageBound) {
    document.body.dataset.emWishlistPageBound = "true";
    document.addEventListener("em:wishlist-changed", renderWishlistPage);
  }

  var courses = getWishlist()
    .map(function (id) { return getCourseById(id); })
    .filter(Boolean);

  var emptyState = document.getElementById("wishlistEmptyState");

  if (courses.length === 0) {
    grid.innerHTML = "";
    grid.classList.add("d-none");
    if (emptyState) emptyState.classList.remove("d-none");
  } else {
    grid.classList.remove("d-none");
    if (emptyState) emptyState.classList.add("d-none");
    grid.innerHTML = courses.map(renderCourseCardHTML).join("");
    initWishlistButtons();
  }

  var countLabel = document.getElementById("wishlistPageCount");
  if (countLabel) {
    countLabel.textContent = courses.length + (courses.length === 1 ? " course saved" : " courses saved");
  }
}

/**
 * Minimal, dependency-free toast. Reuses one container across calls so
 * repeated actions (e.g. toggling several wishlist buttons quickly)
 * don't stack up duplicate DOM nodes.
 * @param {string} message
 */
function showToast(message) {
  var container = document.getElementById("em-toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "em-toast-container";
    container.className = "toast-container position-fixed bottom-0 end-0 p-3";
    container.style.zIndex = "1080";
    document.body.appendChild(container);
  }

  var toastEl = document.createElement("div");
  toastEl.className = "toast align-items-center border-0";
  toastEl.style.backgroundColor = "var(--em-inverse-surface)";
  toastEl.style.color = "var(--em-inverse-on-surface)";
  toastEl.setAttribute("role", "status");
  toastEl.setAttribute("aria-live", "polite");
  toastEl.innerHTML =
    '<div class="d-flex">' +
    '<div class="toast-body">' + message + "</div>" +
    '<button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>' +
    "</div>";

  container.appendChild(toastEl);

  if (window.bootstrap && window.bootstrap.Toast) {
    var toast = new window.bootstrap.Toast(toastEl, { delay: 2200 });
    toastEl.addEventListener("hidden.bs.toast", function () {
      toastEl.remove();
    });
    toast.show();
  } else {
    // Bootstrap JS not loaded on this page for some reason — fall back
    // to a plain timed removal so the message still disappears.
    setTimeout(function () {
      toastEl.remove();
    }, 2200);
  }
}
