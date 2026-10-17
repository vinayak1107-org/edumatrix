/* ==========================================================================
   EduMatrix — courses-data.js
   The single source of truth for course content on the frontend.

   Every page that needs course info (homepage, courses.html,
   course-details.html, cart, wishlist, dashboard, search) reads from
   this same array instead of hardcoding course data of its own.

   Load this file BEFORE any page script that uses EDUMATRIX_COURSES
   or EDUMATRIX_CATEGORIES (see the <script> order at the bottom of
   each HTML page).
   ========================================================================== */

/**
 * @typedef {Object} Course
 * @property {number} id
 * @property {string} title
 * @property {string} category      - must match a slug in EDUMATRIX_CATEGORIES
 * @property {string} instructor
 * @property {string} instructorImage
 * @property {number} price
 * @property {number} [originalPrice] - present when the course is discounted
 * @property {number} rating          - 0–5
 * @property {number} reviews         - review count
 * @property {number} students        - enrolled student count
 * @property {string} duration        - e.g. "18h 40m"
 * @property {"Beginner"|"Intermediate"|"Advanced"} level
 * @property {string} image
 * @property {string} description
 */

var EDUMATRIX_CATEGORIES = [
  { slug: "programming", label: "Programming", icon: "code" },
  { slug: "ai", label: "Artificial Intelligence", icon: "psychology" },
  { slug: "uiux", label: "UI/UX Design", icon: "design_services" },
  { slug: "business", label: "Business Strategy", icon: "trending_up" },
  { slug: "data-science", label: "Data Science", icon: "query_stats" },
  { slug: "web-dev", label: "Web Development", icon: "language" },
  { slug: "marketing", label: "Digital Marketing", icon: "campaign" },
  { slug: "security", label: "Cyber Security", icon: "shield" }
];

/* Reused imagery from the Stitch prototype, cycled across listings.
   Swap these for local files under assets/images/courses/ and
   assets/images/instructors/ once the real asset exports are available. */
var EM_IMG = {
  courses: {
    python: "https://lh3.googleusercontent.com/aida-public/AB6AXuCHMj-zFedvC3Z9EOGuZZ-zTBihhH3XP7KIt2Y-8J2pDSQLEvSYN5Fbu_WC8GQmgseadvr9zPpjY_FqKhVLMzBeTjSHHmx2GV3GCAoZTmXPMr8hsdHOHTcTbwAO6lmQf3FXX2AdfIqgZPRupSrfGPk5JSCrNDnwtFoTnMenNNCSDG6uB_LqNyQJNmNXCbollRkWTELRI6Ewjt0nisQb0mP5paUqrogBvC_0rAkoQVTWx2A9FM_PK3Sh",
    uiux: "https://lh3.googleusercontent.com/aida-public/AB6AXuBlIkNvm51jmhA95srJCQt8alxUgeqWYNJ2CUbGkPGB6Gp-Kp_KwIc5EiNJbmtmzMY9r2Bf6q2qun3Euy9P3mh8gGEClgLUVXXQYelbmoSBbpL2k4K1WudIOBGQPcUyrHzxhGzGKawOv2tVwuB8QCuJGuaXDB4FYekLgb5z1rPk-FswkX7rdwkav2nkFmukVEmqPiCQ6l-j35QF72aOydMYf01bOshoIubhBxSvwN-9F6grwpUesb3P",
    ai: "https://lh3.googleusercontent.com/aida-public/AB6AXuDYbrGyJAVyTXHpVZF-rXIAvNediD33l-GfNq4N0vlJa0euVLAFbahGtF2_fXPBD0dU7Eyl21hREenEk0IF5yXjfyNOA6Z7Mv1aKMzZoK5g1awHmuphs2bE_LzVIxN1XdQ0CxtbGI6fA2iUBUgXnrmWRVrw8PhTcEwzt1COUYOwKdooLdR7oXM-nViN8mVYTlnWdZ-GqFxhuwoq-BTdNRdijg5FlmLsSAkDHZz5Y_1hKW04V072l3yG"
  },
  instructors: {
    mercer: "https://lh3.googleusercontent.com/aida-public/AB6AXuCK3w9xjhl6zk4oJAZAUuJ8RktwLD3khSM1zKPy-am_TZeaF0rmCxMqzb2lQZyv0OVdlcL8gIFR1CRQFgh4VotrTmPK9aoSUhVywzedfJyijDCXLE8qoJ_fdmqQ6HrQ7u0CQzliKD0CtHRocBucldygEadgfixeg44l3Phno4kDUHdCv--07FifdSPks-gSBAXxU19FaWu_zu_WfEAYZdB__OV78tgltjEwV5Oe_BTsHzuqObkWh8c2",
    chen: "https://lh3.googleusercontent.com/aida-public/AB6AXuCZ16UcL1IGAPOEl30uZCq3EzPYF84U5bbyfKzg8WAkZb0ebnUDguPu7pKVEo0ee5T-zDWTPNThxFX_0C6xRwxRJBJY1LGeXcQuDbRqNg7JG2m3-HXawCP09ofiPiR26ynQzRpIoxKHpl3mx3KQCXsEp0-G2g_WtNMBETPpCKjqk5piYknODocvdC33q3HPwEPPJrdtAjkGUBc9V7KZyNyfze-eQellWxpovghjxMU2Q8SSaKWZQZBJ",
    hayes: "https://lh3.googleusercontent.com/aida-public/AB6AXuAQs741woOzVg5Tlt8sx57qUCzsgKf1X1Z5EnPmF-WBedAG_P-5rlSXFIfiCxMV_lE5U3_82T6kmZ-aBq5nyUw6qjYFjCYEGtGzAv3542ZuAz2R8haL2tpZPa4sHKQ5eyihO3GjazM-tzPeDW2Uy9GG5K2AwkANRaylA4zmV-Q6YNn1po8fQfI48cFO4P93xgyWUWoITjjpprBaCck-mqcBlvqpDTCkM92T7oJD57H180zB32m_WLhH"
  }
};

/** @type {Course[]} */
var EDUMATRIX_COURSES = [
  {
    id: 1,
    title: "Advanced Python Architectures",
    category: "programming",
    instructor: "Dr. A. Mercer",
    instructorImage: EM_IMG.instructors.mercer,
    price: 199,
    originalPrice: 249,
    rating: 4.9,
    reviews: 2100,
    students: 8400,
    duration: "18h 40m",
    level: "Advanced",
    image: EM_IMG.courses.python,
    description: "Design and ship large-scale Python systems: clean architecture, async pipelines, and production-grade testing patterns used by senior engineering teams."
  },
  {
    id: 2,
    title: "Editorial UI Systems",
    category: "uiux",
    instructor: "S. Chen",
    instructorImage: EM_IMG.instructors.chen,
    price: 149,
    rating: 4.8,
    reviews: 1800,
    students: 6100,
    duration: "12h 10m",
    level: "Intermediate",
    image: EM_IMG.courses.uiux,
    description: "Build premium, editorial-grade design systems: type scales, tonal color, and component libraries that scale across an entire product."
  },
  {
    id: 3,
    title: "Machine Learning Foundations",
    category: "ai",
    instructor: "J. Hayes",
    instructorImage: EM_IMG.instructors.hayes,
    price: 249,
    rating: 5.0,
    reviews: 3200,
    students: 11200,
    duration: "24h 00m",
    level: "Beginner",
    image: EM_IMG.courses.ai,
    description: "A rigorous, practical introduction to machine learning: supervised and unsupervised methods, model evaluation, and real datasets from day one."
  },
  {
    id: 4,
    title: "Modern Web Application Design",
    category: "web-dev",
    instructor: "S. Chen",
    instructorImage: EM_IMG.instructors.chen,
    price: 179,
    originalPrice: 219,
    rating: 4.7,
    reviews: 1420,
    students: 5300,
    duration: "16h 25m",
    level: "Intermediate",
    image: EM_IMG.courses.uiux,
    description: "From semantic HTML to component architecture: build fast, accessible, responsive web applications with a professional engineering workflow."
  },
  {
    id: 5,
    title: "Deep Learning with Neural Networks",
    category: "ai",
    instructor: "J. Hayes",
    instructorImage: EM_IMG.instructors.hayes,
    price: 279,
    rating: 4.9,
    reviews: 2760,
    students: 9800,
    duration: "28h 15m",
    level: "Advanced",
    image: EM_IMG.courses.ai,
    description: "Go beyond the basics: convolutional and transformer architectures, training at scale, and deploying models to production."
  },
  {
    id: 6,
    title: "Data Storytelling & Analytics",
    category: "data-science",
    instructor: "Dr. A. Mercer",
    instructorImage: EM_IMG.instructors.mercer,
    price: 159,
    rating: 4.6,
    reviews: 980,
    students: 4200,
    duration: "14h 50m",
    level: "Beginner",
    image: EM_IMG.courses.python,
    description: "Turn raw data into decisions leadership acts on: statistical fundamentals, visualization craft, and narrative structure for analytics."
  },
  {
    id: 7,
    title: "Strategic Growth for Founders",
    category: "business",
    instructor: "J. Hayes",
    instructorImage: EM_IMG.instructors.hayes,
    price: 229,
    rating: 4.8,
    reviews: 1340,
    students: 3900,
    duration: "10h 05m",
    level: "Intermediate",
    image: EM_IMG.courses.ai,
    description: "A practical playbook for scaling an early-stage company: positioning, pricing, go-to-market sequencing, and operating cadence."
  },
  {
    id: 8,
    title: "Performance Marketing Systems",
    category: "marketing",
    instructor: "S. Chen",
    instructorImage: EM_IMG.instructors.chen,
    price: 139,
    originalPrice: 179,
    rating: 4.5,
    reviews: 860,
    students: 3100,
    duration: "9h 30m",
    level: "Beginner",
    image: EM_IMG.courses.uiux,
    description: "Build repeatable acquisition funnels: channel strategy, attribution, creative testing, and budget allocation that compounds."
  },
  {
    id: 9,
    title: "Applied Cyber Security Fundamentals",
    category: "security",
    instructor: "Dr. A. Mercer",
    instructorImage: EM_IMG.instructors.mercer,
    price: 199,
    rating: 4.7,
    reviews: 1120,
    students: 4600,
    duration: "20h 00m",
    level: "Intermediate",
    image: EM_IMG.courses.python,
    description: "Threat modeling, secure architecture, and incident response fundamentals for engineers who ship production systems."
  },
  {
    id: 10,
    title: "Product Design Systems at Scale",
    category: "uiux",
    instructor: "S. Chen",
    instructorImage: EM_IMG.instructors.chen,
    price: 189,
    rating: 4.9,
    reviews: 1560,
    students: 5900,
    duration: "15h 45m",
    level: "Advanced",
    image: EM_IMG.courses.uiux,
    description: "How premium product teams design, govern, and version a shared component library across web and native platforms."
  },
  {
    id: 11,
    title: "Backend Engineering with Node.js",
    category: "web-dev",
    instructor: "Dr. A. Mercer",
    instructorImage: EM_IMG.instructors.mercer,
    price: 169,
    rating: 4.6,
    reviews: 1010,
    students: 4700,
    duration: "17h 20m",
    level: "Intermediate",
    image: EM_IMG.courses.python,
    description: "Design resilient APIs and services with Node.js: authentication, queues, caching, and observability for real production traffic."
  },
  {
    id: 12,
    title: "AI Product Strategy",
    category: "business",
    instructor: "J. Hayes",
    instructorImage: EM_IMG.instructors.hayes,
    price: 219,
    rating: 4.8,
    reviews: 1290,
    students: 4100,
    duration: "11h 15m",
    level: "Advanced",
    image: EM_IMG.courses.ai,
    description: "How to scope, ship, and evaluate AI-powered features: model selection trade-offs, UX for uncertainty, and measuring real value."
  }
];

/**
 * Look up a single course by id. Returns undefined if not found.
 * @param {number|string} id
 * @returns {Course|undefined}
 */
function getCourseById(id) {
  var numericId = Number(id);
  return EDUMATRIX_COURSES.find(function (course) {
    return course.id === numericId;
  });
}

/**
 * Look up a category's display label from its slug.
 * @param {string} slug
 * @returns {string}
 */
function getCategoryLabel(slug) {
  var match = EDUMATRIX_CATEGORIES.find(function (c) {
    return c.slug === slug;
  });
  return match ? match.label : slug;
}

/**
 * Builds the HTML for one course card. Used by every page that renders
 * course listings (courses.html, homepage sections added later, related
 * courses on course-details.html, dashboard recommendations, etc.) so
 * the card markup — and therefore its styling and behavior — never
 * drifts between pages.
 * @param {Course} course
 * @returns {string}
 */
function renderCourseCardHTML(course) {
  var hasDiscount = typeof course.originalPrice === "number" && course.originalPrice > course.price;
  var priceMarkup = hasDiscount
    ? '<span class="em-course-card__price">$' + course.price + '</span>' +
      '<span class="text-caption text-muted-em text-decoration-line-through ms-1">$' + course.originalPrice + '</span>'
    : '<span class="em-course-card__price">$' + course.price + '</span>';

  return (
    '<div class="col-12 col-md-6 col-lg-4">' +
      '<article class="em-course-card shadow-em-1 em-reveal is-visible">' +
        '<a href="course-details.html?id=' + course.id + '" class="em-course-card__media d-block">' +
          '<img src="' + course.image + '" alt="' + course.title + ' course cover" loading="lazy" />' +
          '<span class="em-course-card__badge">' + getCategoryLabel(course.category) + '</span>' +
        '</a>' +
        '<button type="button" class="em-course-card__wishlist" data-course-id="' + course.id + '" aria-pressed="false" aria-label="Add ' + course.title + ' to wishlist">' +
          '<span class="material-symbols-outlined" aria-hidden="true">favorite</span>' +
        '</button>' +
        '<div class="em-course-card__body">' +
          '<div class="em-course-card__rating">' +
            '<span class="material-symbols-outlined icon-fill" aria-hidden="true">star</span>' +
            '<span class="text-label-md">' + course.rating.toFixed(1) + ' (' + formatCount(course.reviews) + ' reviews)</span>' +
          '</div>' +
          '<h3 class="em-course-card__title">' +
            '<a href="course-details.html?id=' + course.id + '" class="text-decoration-none" style="color: inherit;">' + course.title + '</a>' +
          '</h3>' +
          '<div class="em-course-card__footer">' +
            '<div class="em-course-card__instructor">' +
              '<img src="' + course.instructorImage + '" alt="Portrait of ' + course.instructor + '" loading="lazy" />' +
              '<span class="text-label-md">' + course.instructor + '</span>' +
            '</div>' +
            priceMarkup +
          '</div>' +
        '</div>' +
      '</article>' +
    '</div>'
  );
}

/**
 * Formats a review/student count the way editorial platforms usually
 * do: 2100 -> "2.1k", 980 -> "980".
 * @param {number} count
 * @returns {string}
 */
function formatCount(count) {
  if (count >= 1000) {
    return (count / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  }
  return String(count);
}
