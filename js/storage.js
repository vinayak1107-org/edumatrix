/* ==========================================================================
   EduMatrix — storage.js
   Small, reusable helpers around localStorage. Every page that touches
   the cart or wishlist should go through these functions instead of
   calling localStorage.getItem/setItem directly — that keeps the key
   names and JSON parsing/error-handling in exactly one place.
   ========================================================================== */

var EDUMATRIX_KEYS = {
  cart: "edumatrix_cart",
  wishlist: "edumatrix_wishlist",
  user: "edumatrix_user",
  accounts: "edumatrix_accounts",
  orders: "edumatrix_orders",
  progress: "edumatrix_progress",
  notifications: "edumatrix_notifications",
  instructorCourses: "edumatrix_instructor_courses",
  instructorPayouts: "edumatrix_instructor_payouts"
};

/**
 * Reads and parses a JSON value from localStorage.
 * @param {string} key
 * @param {*} fallback - returned if the key is missing or unparsable
 */
function emGetJSON(key, fallback) {
  try {
    var raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.error("EduMatrix storage read failed for key:", key, err);
    return fallback;
  }
}

/**
 * Stringifies and writes a value to localStorage.
 * @param {string} key
 * @param {*} value
 */
function emSetJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error("EduMatrix storage write failed for key:", key, err);
    return false;
  }
}

/* --------------------------------------------------------------------------
   WISHLIST
   Stored as an array of course id numbers, e.g. [1, 4, 9]
   -------------------------------------------------------------------------- */

function getWishlist() {
  return emGetJSON(EDUMATRIX_KEYS.wishlist, []);
}

function isInWishlist(courseId) {
  return getWishlist().indexOf(Number(courseId)) !== -1;
}

/**
 * Adds the course if absent, removes it if present.
 * @returns {boolean} the new "is in wishlist" state
 */
function toggleWishlist(courseId) {
  var id = Number(courseId);
  var list = getWishlist();
  var index = list.indexOf(id);

  if (index === -1) {
    list.push(id);
  } else {
    list.splice(index, 1);
  }

  emSetJSON(EDUMATRIX_KEYS.wishlist, list);
  return index === -1; // true if we just added it
}

function getWishlistCount() {
  return getWishlist().length;
}

/* --------------------------------------------------------------------------
   CART
   Stored as an array of { courseId, quantity } objects. Quantity exists
   for structural consistency with typical cart models; course purchases
   are one-per-course, so quantity is effectively always 1.
   -------------------------------------------------------------------------- */

function getCart() {
  return emGetJSON(EDUMATRIX_KEYS.cart, []);
}

function isInCart(courseId) {
  var id = Number(courseId);
  return getCart().some(function (item) {
    return item.courseId === id;
  });
}

function addToCart(courseId) {
  var id = Number(courseId);
  var cart = getCart();
  if (!cart.some(function (item) { return item.courseId === id; })) {
    cart.push({ courseId: id, quantity: 1 });
    emSetJSON(EDUMATRIX_KEYS.cart, cart);
  }
  return cart;
}

function removeFromCart(courseId) {
  var id = Number(courseId);
  var cart = getCart().filter(function (item) {
    return item.courseId !== id;
  });
  emSetJSON(EDUMATRIX_KEYS.cart, cart);
  return cart;
}

function getCartCount() {
  return getCart().length;
}
