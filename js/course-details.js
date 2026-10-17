/* ==========================================================================
   EduMatrix — course-details.js
   Reads the ?id= query param, looks the course up in EDUMATRIX_COURSES,
   and renders every section of course-details.html from that one record
   (plus a handful of generic, template-driven sections — curriculum,
   FAQ, reviews — since the demo data model doesn't carry that level of
   per-course detail).

   Depends on: courses-data.js, storage.js, wishlist.js (all loaded first)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {
  var courseId = new URLSearchParams(window.location.search).get("id");
  var course = getCourseById(courseId);

  if (!course) {
    showNotFoundState();
    return;
  }

  renderCourseDetail(course);
  bindPurchaseActions(course);
});

function showNotFoundState() {
  document.getElementById("notFoundState").classList.remove("d-none");
  document.getElementById("courseDetailContent").classList.add("d-none");
}

function renderCourseDetail(course) {
  document.getElementById("courseDetailContent").classList.remove("d-none");

  document.title = course.title + " | EduMatrix";
  var metaDescription = document.getElementById("pageDescription");
  if (metaDescription) metaDescription.setAttribute("content", course.description);

  var categoryLabel = getCategoryLabel(course.category);
  document.getElementById("breadcrumbCategory").textContent = course.title;
  document.getElementById("cdCategoryBadge").textContent = categoryLabel;
  document.getElementById("cdTitle").textContent = course.title;
  document.getElementById("cdStarRating").innerHTML = buildStarRatingHTML(course.rating);
  document.getElementById("cdRatingText").textContent =
    course.rating.toFixed(1) + " (" + formatCount(course.reviews) + " reviews)";
  document.getElementById("cdStudentsText").textContent =
    course.students.toLocaleString() + " students";

  var heroImg = document.getElementById("cdHeroImage");
  heroImg.src = course.image;
  heroImg.alt = course.title + " course preview";

  document.getElementById("cdDescription").textContent = course.description;
  document.getElementById("cdOutcomes").innerHTML = buildOutcomesHTML(course);
  document.getElementById("cdRequirements").innerHTML = buildRequirementsHTML(course);
  document.getElementById("cdCurriculum").innerHTML = buildCurriculumHTML(course);

  document.getElementById("cdInstructorImage").src = course.instructorImage;
  document.getElementById("cdInstructorImage").alt = "Portrait of " + course.instructor;
  document.getElementById("cdInstructorName").textContent = course.instructor;
  document.getElementById("cdInstructorMeta").textContent = categoryLabel + " Mentor · EduMatrix";
  document.getElementById("cdInstructorBio").textContent =
    course.instructor + " is an EduMatrix mentor specializing in " + categoryLabel.toLowerCase() +
    ", with a teaching style focused on practical, real-world application over theory alone.";

  document.getElementById("cdReviews").innerHTML = buildReviewsHTML(course);
  document.getElementById("cdFAQ").innerHTML = buildFAQHTML(course);

  document.getElementById("cdPrice").textContent = "$" + course.price;
  var originalPriceEl = document.getElementById("cdOriginalPrice");
  var discountBadge = document.getElementById("cdDiscountBadge");
  if (course.originalPrice && course.originalPrice > course.price) {
    var percentOff = Math.round((1 - course.price / course.originalPrice) * 100);
    originalPriceEl.textContent = "$" + course.originalPrice;
    originalPriceEl.classList.remove("d-none");
    discountBadge.textContent = percentOff + "% off — limited time";
    discountBadge.classList.remove("d-none");
  }

  document.getElementById("cdDuration").textContent = course.duration;
  document.getElementById("cdLevel").textContent = course.level + " level";

  document.getElementById("cdRelatedCourses").innerHTML = buildRelatedCoursesHTML(course);
  initWishlistButtons(); // wires up wishlist hearts on the related course cards
}

/* --------------------------------------------------------------------------
   RENDER HELPERS
   -------------------------------------------------------------------------- */

function buildStarRatingHTML(rating) {
  var fullStars = Math.floor(rating);
  var hasHalfStar = rating - fullStars >= 0.5;
  var html = "";

  for (var i = 0; i < fullStars; i++) {
    html += '<span class="material-symbols-outlined icon-fill">star</span>';
  }
  if (hasHalfStar) {
    html += '<span class="material-symbols-outlined icon-fill">star_half</span>';
  }
  var emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  for (var j = 0; j < emptyStars; j++) {
    html += '<span class="material-symbols-outlined">star</span>';
  }
  return html;
}

function buildOutcomesHTML(course) {
  var outcomes = [
    "Build real, portfolio-ready projects in " + getCategoryLabel(course.category).toLowerCase(),
    "Understand the core concepts behind " + course.title.toLowerCase(),
    "Apply " + course.level.toLowerCase() + "-level techniques used in professional practice",
    "Get feedback-ready work reviewed against industry standards"
  ];

  return outcomes.map(function (text) {
    return (
      '<div class="col-12 col-sm-6 d-flex align-items-start gap-2">' +
        '<span class="material-symbols-outlined" style="color: var(--em-primary);" aria-hidden="true">check_circle</span>' +
        '<span class="text-body-md">' + text + '</span>' +
      '</div>'
    );
  }).join("");
}

function buildRequirementsHTML(course) {
  var requirements = course.level === "Beginner"
    ? ["No prior experience required", "A computer with internet access", "Willingness to practice consistently"]
    : ["Comfortable with " + getCategoryLabel(course.category).toLowerCase() + " fundamentals", "A computer with internet access", "Prior coursework or equivalent experience recommended"];

  return requirements.map(function (text) {
    return '<li class="text-body-md">' + text + '</li>';
  }).join("");
}

function buildCurriculumHTML(course) {
  var modules = [
    { title: "Module 01 — Introduction", lessons: [
      { title: "Welcome & Course Overview", duration: "6 min", type: "Video", preview: true },
      { title: "Setting Up Your Environment", duration: "12 min", type: "Video", preview: false }
    ]},
    { title: "Module 02 — Core Concepts", lessons: [
      { title: "Foundational Principles", duration: "18 min", type: "Video", preview: false },
      { title: "Guided Walkthrough", duration: "22 min", type: "Video", preview: false },
      { title: "Knowledge Check", duration: "5 min", type: "Quiz", preview: false }
    ]},
    { title: "Module 03 — Practical Implementation", lessons: [
      { title: "Building the First Project", duration: "35 min", type: "Video", preview: false },
      { title: "Common Pitfalls & Fixes", duration: "15 min", type: "Video", preview: false }
    ]},
    { title: "Module 04 — Advanced Techniques", lessons: [
      { title: "Going Beyond the Basics", duration: "28 min", type: "Video", preview: false },
      { title: "Case Study Breakdown", duration: "20 min", type: "Video", preview: false }
    ]},
    { title: "Module 05 — Final Project", lessons: [
      { title: "Final Project Brief", duration: "10 min", type: "Video", preview: false },
      { title: "Submission & Certificate", duration: "8 min", type: "Video", preview: false }
    ]}
  ];

  return modules.map(function (module, index) {
    var accordionId = "curriculumModule" + index;
    var lessonsHTML = module.lessons.map(function (lesson) {
      return (
        '<li class="d-flex align-items-center justify-content-between py-2" style="border-bottom: 1px solid var(--em-outline-variant);">' +
          '<span class="d-flex align-items-center gap-2 text-body-md">' +
            '<span class="material-symbols-outlined" style="font-size: 18px;" aria-hidden="true">' + (lesson.type === "Quiz" ? "quiz" : "play_circle") + '</span>' +
            lesson.title +
            (lesson.preview ? '<span class="em-course-card__badge" style="position: static; font-size: 11px;">Preview</span>' : "") +
          '</span>' +
          '<span class="text-caption text-muted-em">' + lesson.duration + '</span>' +
        '</li>'
      );
    }).join("");

    return (
      '<div class="accordion-item">' +
        '<h3 class="accordion-header">' +
          '<button class="accordion-button' + (index === 0 ? '' : ' collapsed') + '" type="button" data-bs-toggle="collapse" data-bs-target="#' + accordionId + '" aria-expanded="' + (index === 0 ? 'true' : 'false') + '">' +
            module.title +
            '<span class="text-caption text-muted-em ms-2">(' + module.lessons.length + ' lessons)</span>' +
          '</button>' +
        '</h3>' +
        '<div id="' + accordionId + '" class="accordion-collapse collapse' + (index === 0 ? ' show' : '') + '" data-bs-parent="#cdCurriculum">' +
          '<div class="accordion-body pt-0">' +
            '<ul class="list-unstyled m-0">' + lessonsHTML + '</ul>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }).join("");
}

function buildReviewsHTML(course) {
  var reviews = [
    { name: "M. Alvarez", rating: 5, text: "Clear, well-paced, and immediately applicable to my day-to-day work. The projects made the difference." },
    { name: "K. Osei", rating: 5, text: "One of the better-structured courses I've taken on this topic. Instructor explains the 'why', not just the 'how'." },
    { name: "R. Patel", rating: 4, text: "Solid course overall. A couple of sections could use more depth, but genuinely useful content." }
  ];

  return reviews.map(function (review) {
    return (
      '<div class="shadow-em-1 rounded-4 p-4" style="border-radius: var(--em-radius-lg);">' +
        '<div class="d-flex align-items-center justify-content-between mb-2">' +
          '<span class="text-label-md">' + review.name + '</span>' +
          '<span class="em-star-rating" aria-hidden="true">' + buildStarRatingHTML(review.rating) + '</span>' +
        '</div>' +
        '<p class="text-body-md text-muted-em m-0">' + review.text + '</p>' +
      '</div>'
    );
  }).join("");
}

function buildFAQHTML(course) {
  var faqs = [
    { q: "Do I get lifetime access to this course?", a: "Yes. Once purchased, " + course.title + " is available in your dashboard indefinitely, including all future content updates." },
    { q: "Is there a certificate on completion?", a: "Yes. Completing every module unlocks a downloadable EduMatrix certificate for " + course.title + "." },
    { q: "What if this course isn't right for me?", a: "Contact support within 14 days of purchase for a full refund, no questions asked." }
  ];

  return faqs.map(function (faq, index) {
    var accordionId = "faqItem" + index;
    return (
      '<div class="accordion-item">' +
        '<h3 class="accordion-header">' +
          '<button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#' + accordionId + '" aria-expanded="false">' +
            faq.q +
          '</button>' +
        '</h3>' +
        '<div id="' + accordionId + '" class="accordion-collapse collapse" data-bs-parent="#cdFAQ">' +
          '<div class="accordion-body pt-0 text-body-md text-muted-em">' + faq.a + '</div>' +
        '</div>' +
      '</div>'
    );
  }).join("");
}

function buildRelatedCoursesHTML(course) {
  var related = EDUMATRIX_COURSES
    .filter(function (c) { return c.category === course.category && c.id !== course.id; })
    .slice(0, 3);

  if (related.length === 0) {
    related = EDUMATRIX_COURSES.filter(function (c) { return c.id !== course.id; }).slice(0, 3);
  }

  return related.map(renderCourseCardHTML).join("");
}

/* --------------------------------------------------------------------------
   PURCHASE ACTIONS
   -------------------------------------------------------------------------- */

function bindPurchaseActions(course) {
  var addToCartBtn = document.getElementById("addToCartBtn");
  var buyNowBtn = document.getElementById("buyNowBtn");
  var wishlistBtn = document.getElementById("wishlistBtn");

  updateAddToCartButtonState(addToCartBtn, course.id);
  updateWishlistButtonState(wishlistBtn, course.id);

  addToCartBtn.addEventListener("click", function () {
    if (isInCart(course.id)) {
      removeFromCart(course.id);
    } else {
      addToCart(course.id);
    }
    updateAddToCartButtonState(addToCartBtn, course.id);
    updateCartCountBadges();
    showToast(isInCart(course.id) ? "Added to cart" : "Removed from cart");
  });

  buyNowBtn.addEventListener("click", function () {
    addToCart(course.id);
    updateCartCountBadges();
    window.location.href = "checkout.html?id=" + course.id;
  });

  wishlistBtn.addEventListener("click", function () {
    var isNowActive = toggleWishlist(course.id);
    updateWishlistButtonState(wishlistBtn, course.id);
    updateWishlistCountBadges();
    showToast(isNowActive ? "Added to wishlist" : "Removed from wishlist");
  });
}

function updateAddToCartButtonState(btn, courseId) {
  var inCart = isInCart(courseId);
  btn.textContent = inCart ? "Remove from Cart" : "Add to Cart";
}

function updateWishlistButtonState(btn, courseId) {
  var active = isInWishlist(courseId);
  var icon = document.getElementById("wishlistBtnIcon");
  var label = document.getElementById("wishlistBtnLabel");
  btn.setAttribute("aria-pressed", String(active));
  icon.textContent = active ? "favorite" : "favorite_border";
  label.textContent = active ? "Saved to Wishlist" : "Add to Wishlist";
}
