/* ==========================================================================
   EduMatrix — courses.js
   Page-specific logic for courses.html: live search, category/level/
   rating/price filters, sorting, and pagination — all client-side over
   the EDUMATRIX_COURSES array from courses-data.js.

   Depends on: courses-data.js, storage.js, wishlist.js (all loaded first)
   ========================================================================== */

var COURSES_PAGE_SIZE = 9;

var coursesPageState = {
  search: "",
  categories: [],   // array of category slugs
  levels: [],        // array of "Beginner" | "Intermediate" | "Advanced"
  minRating: 0,
  maxPrice: getMaxCoursePrice(),
  sort: "relevance",
  page: 1
};

document.addEventListener("DOMContentLoaded", function () {
  readFiltersFromURL();
  document.getElementById("courseSearch").value = coursesPageState.search;
  renderFilterPanels();
  bindTopControls();
  applyFiltersAndRender();
});

function getMaxCoursePrice() {
  return EDUMATRIX_COURSES.reduce(function (max, c) {
    return Math.max(max, c.price);
  }, 0);
}

/**
 * Supports linking directly to a pre-filtered category, e.g.
 * courses.html?category=ai (used by the homepage discipline cards).
 */
function readFiltersFromURL() {
  var params = new URLSearchParams(window.location.search);
  var category = params.get("category");
  var search = params.get("search");

  if (category && EDUMATRIX_CATEGORIES.some(function (c) { return c.slug === category; })) {
    coursesPageState.categories = [category];
  }
  if (search) {
    coursesPageState.search = search.trim().toLowerCase();
  }
}

/* --------------------------------------------------------------------------
   FILTER PANEL (rendered once, then cloned into the mobile offcanvas)
   -------------------------------------------------------------------------- */

function renderFilterPanels() {
  var html = buildFilterPanelHTML();
  document.getElementById("filterPanelDesktop").innerHTML = html;
  document.getElementById("filterPanelMobile").innerHTML = html;
  bindFilterControls();
}

function buildFilterPanelHTML() {
  var categoryOptions = EDUMATRIX_CATEGORIES.map(function (cat) {
    var checked = coursesPageState.categories.indexOf(cat.slug) !== -1 ? "checked" : "";
    return (
      '<div class="form-check mb-2">' +
        '<input class="form-check-input" type="checkbox" value="' + cat.slug + '" id="cat-' + cat.slug + '" data-filter-category ' + checked + ' />' +
        '<label class="form-check-label text-body-md" for="cat-' + cat.slug + '">' + cat.label + '</label>' +
      '</div>'
    );
  }).join("");

  var levels = ["Beginner", "Intermediate", "Advanced"];
  var levelOptions = levels.map(function (level) {
    var checked = coursesPageState.levels.indexOf(level) !== -1 ? "checked" : "";
    var id = "level-" + level.toLowerCase();
    return (
      '<div class="form-check mb-2">' +
        '<input class="form-check-input" type="checkbox" value="' + level + '" id="' + id + '" data-filter-level ' + checked + ' />' +
        '<label class="form-check-label text-body-md" for="' + id + '">' + level + '</label>' +
      '</div>'
    );
  }).join("");

  var ratingOptions = [4.5, 4.0, 3.5].map(function (rating) {
    var checked = coursesPageState.minRating === rating ? "checked" : "";
    var id = "rating-" + rating.toString().replace(".", "");
    return (
      '<div class="form-check mb-2">' +
        '<input class="form-check-input" type="radio" name="ratingFilter" value="' + rating + '" id="' + id + '" data-filter-rating ' + checked + ' />' +
        '<label class="form-check-label text-body-md" for="' + id + '">' + rating.toFixed(1) + '+ stars</label>' +
      '</div>'
    );
  }).join("");

  var maxPrice = getMaxCoursePrice();

  return (
    '<div class="shadow-em-1 rounded-4 p-4 bg-white" style="background-color: var(--em-surface-lowest);">' +
      '<div class="mb-4">' +
        '<h3 class="text-label-md text-uppercase mb-3" style="letter-spacing: 0.04em;">Category</h3>' +
        categoryOptions +
      '</div>' +
      '<hr style="border-color: var(--em-outline-variant);" />' +
      '<div class="mb-4 mt-4">' +
        '<h3 class="text-label-md text-uppercase mb-3" style="letter-spacing: 0.04em;">Level</h3>' +
        levelOptions +
      '</div>' +
      '<hr style="border-color: var(--em-outline-variant);" />' +
      '<div class="mb-4 mt-4">' +
        '<h3 class="text-label-md text-uppercase mb-3" style="letter-spacing: 0.04em;">Rating</h3>' +
        ratingOptions +
      '</div>' +
      '<hr style="border-color: var(--em-outline-variant);" />' +
      '<div class="mt-4">' +
        '<h3 class="text-label-md text-uppercase mb-3" style="letter-spacing: 0.04em;">Max Price</h3>' +
        '<input type="range" class="form-range" min="0" max="' + maxPrice + '" step="10" value="' + coursesPageState.maxPrice + '" data-filter-price id="priceRange" />' +
        '<p class="text-body-md text-muted-em m-0">Up to <span data-price-value>$' + coursesPageState.maxPrice + '</span></p>' +
      '</div>' +
    '</div>'
  );
}

/**
 * Attaches change listeners to every filter control on the page. Since
 * the same filter panel HTML exists twice (desktop sidebar + mobile
 * offcanvas), this queries ALL matching controls by attribute and keeps
 * both copies of a given control in sync so the two panels never
 * disagree with each other.
 */
function bindFilterControls() {
  document.querySelectorAll("[data-filter-category]").forEach(function (el) {
    el.addEventListener("change", function () {
      syncCheckboxAcrossPanels("[data-filter-category]", el.value, el.checked);
      coursesPageState.categories = getCheckedValues("[data-filter-category]");
      coursesPageState.page = 1;
      applyFiltersAndRender();
    });
  });

  document.querySelectorAll("[data-filter-level]").forEach(function (el) {
    el.addEventListener("change", function () {
      syncCheckboxAcrossPanels("[data-filter-level]", el.value, el.checked);
      coursesPageState.levels = getCheckedValues("[data-filter-level]");
      coursesPageState.page = 1;
      applyFiltersAndRender();
    });
  });

  document.querySelectorAll("[data-filter-rating]").forEach(function (el) {
    el.addEventListener("change", function () {
      syncRadioAcrossPanels("[data-filter-rating]", el.value);
      coursesPageState.minRating = Number(el.value);
      coursesPageState.page = 1;
      applyFiltersAndRender();
    });
  });

  document.querySelectorAll("[data-filter-price]").forEach(function (el) {
    el.addEventListener("input", function () {
      var value = Number(el.value);
      document.querySelectorAll("[data-filter-price]").forEach(function (rangeEl) {
        rangeEl.value = value;
      });
      document.querySelectorAll("[data-price-value]").forEach(function (label) {
        label.textContent = "$" + value;
      });
      coursesPageState.maxPrice = value;
      coursesPageState.page = 1;
      applyFiltersAndRender();
    });
  });
}

function syncCheckboxAcrossPanels(selector, value, checked) {
  document.querySelectorAll(selector).forEach(function (el) {
    if (el.value === value) el.checked = checked;
  });
}

function syncRadioAcrossPanels(selector, value) {
  document.querySelectorAll(selector).forEach(function (el) {
    el.checked = el.value === value;
  });
}

function getCheckedValues(selector) {
  return Array.prototype.slice
    .call(document.querySelectorAll(selector + ":checked"))
    .map(function (el) { return el.value; })
    // de-duplicate, since the same value exists in both the desktop and mobile panel
    .filter(function (value, index, arr) { return arr.indexOf(value) === index; });
}

/* --------------------------------------------------------------------------
   TOP CONTROLS: search + sort + clear
   -------------------------------------------------------------------------- */

function bindTopControls() {
  var searchInput = document.getElementById("courseSearch");
  searchInput.addEventListener("input", function () {
    coursesPageState.search = searchInput.value.trim().toLowerCase();
    coursesPageState.page = 1;
    applyFiltersAndRender();
  });

  var sortSelect = document.getElementById("courseSort");
  sortSelect.addEventListener("change", function () {
    coursesPageState.sort = sortSelect.value;
    applyFiltersAndRender();
  });

  document.getElementById("clearFiltersBtn").addEventListener("click", clearAllFilters);
  document.getElementById("emptyStateClearBtn").addEventListener("click", clearAllFilters);
}

function clearAllFilters() {
  coursesPageState.search = "";
  coursesPageState.categories = [];
  coursesPageState.levels = [];
  coursesPageState.minRating = 0;
  coursesPageState.maxPrice = getMaxCoursePrice();
  coursesPageState.sort = "relevance";
  coursesPageState.page = 1;

  document.getElementById("courseSearch").value = "";
  document.getElementById("courseSort").value = "relevance";
  renderFilterPanels();
  applyFiltersAndRender();
}

/* --------------------------------------------------------------------------
   FILTER + SORT + RENDER
   -------------------------------------------------------------------------- */

function applyFiltersAndRender() {
  var filtered = EDUMATRIX_COURSES.filter(function (course) {
    var matchesSearch =
      !coursesPageState.search ||
      course.title.toLowerCase().indexOf(coursesPageState.search) !== -1 ||
      course.instructor.toLowerCase().indexOf(coursesPageState.search) !== -1 ||
      getCategoryLabel(course.category).toLowerCase().indexOf(coursesPageState.search) !== -1;

    var matchesCategory =
      coursesPageState.categories.length === 0 ||
      coursesPageState.categories.indexOf(course.category) !== -1;

    var matchesLevel =
      coursesPageState.levels.length === 0 ||
      coursesPageState.levels.indexOf(course.level) !== -1;

    var matchesRating = course.rating >= coursesPageState.minRating;
    var matchesPrice = course.price <= coursesPageState.maxPrice;

    return matchesSearch && matchesCategory && matchesLevel && matchesRating && matchesPrice;
  });

  filtered = sortCourses(filtered, coursesPageState.sort);

  updateResultCount(filtered.length);
  updateClearFiltersVisibility();

  var totalPages = Math.max(1, Math.ceil(filtered.length / COURSES_PAGE_SIZE));
  coursesPageState.page = Math.min(coursesPageState.page, totalPages);

  var start = (coursesPageState.page - 1) * COURSES_PAGE_SIZE;
  var pageItems = filtered.slice(start, start + COURSES_PAGE_SIZE);

  renderCourseGrid(pageItems, filtered.length);
  renderPagination(totalPages);
}

function sortCourses(list, sortKey) {
  var sorted = list.slice();
  switch (sortKey) {
    case "rating":
      sorted.sort(function (a, b) { return b.rating - a.rating; });
      break;
    case "price-asc":
      sorted.sort(function (a, b) { return a.price - b.price; });
      break;
    case "price-desc":
      sorted.sort(function (a, b) { return b.price - a.price; });
      break;
    case "students":
      sorted.sort(function (a, b) { return b.students - a.students; });
      break;
    default:
      // "relevance" keeps catalog order
      break;
  }
  return sorted;
}

function updateResultCount(count) {
  var el = document.getElementById("resultCount");
  if (count === EDUMATRIX_COURSES.length) {
    el.textContent = "Showing all " + count + " courses";
  } else {
    el.textContent = "Showing " + count + " of " + EDUMATRIX_COURSES.length + " courses";
  }
}

function updateClearFiltersVisibility() {
  var hasActiveFilters =
    coursesPageState.search ||
    coursesPageState.categories.length > 0 ||
    coursesPageState.levels.length > 0 ||
    coursesPageState.minRating > 0 ||
    coursesPageState.maxPrice < getMaxCoursePrice();

  document.getElementById("clearFiltersBtn").classList.toggle("d-none", !hasActiveFilters);
}

function renderCourseGrid(courses, totalFilteredCount) {
  var grid = document.getElementById("courseGrid");
  var emptyState = document.getElementById("emptyState");

  if (totalFilteredCount === 0) {
    grid.innerHTML = "";
    grid.classList.add("d-none");
    emptyState.classList.remove("d-none");
    return;
  }

  grid.classList.remove("d-none");
  emptyState.classList.add("d-none");
  grid.innerHTML = courses.map(renderCourseCardHTML).join("");

  // Re-wire wishlist buttons for the freshly rendered cards.
  initWishlistButtons();
}

function renderPagination(totalPages) {
  var pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  if (totalPages <= 1) return;

  pagination.appendChild(buildPageItem("«", coursesPageState.page - 1, coursesPageState.page === 1));

  for (var i = 1; i <= totalPages; i++) {
    pagination.appendChild(buildPageItem(String(i), i, false, i === coursesPageState.page));
  }

  pagination.appendChild(buildPageItem("»", coursesPageState.page + 1, coursesPageState.page === totalPages));
}

function buildPageItem(label, targetPage, disabled, isActive) {
  var li = document.createElement("li");
  li.className = "page-item" + (disabled ? " disabled" : "") + (isActive ? " active" : "");

  var button = document.createElement("button");
  button.type = "button";
  button.className = "page-link";
  button.style.borderRadius = "var(--em-radius)";
  button.textContent = label;
  if (isActive) {
    button.style.backgroundColor = "var(--em-primary-container)";
    button.style.borderColor = "var(--em-primary-container)";
    button.style.color = "var(--em-on-primary-container)";
  }
  button.setAttribute("aria-label", "Go to page " + targetPage);

  if (!disabled) {
    button.addEventListener("click", function () {
      coursesPageState.page = targetPage;
      applyFiltersAndRender();
      document.getElementById("resultCount").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  li.appendChild(button);
  return li;
}
