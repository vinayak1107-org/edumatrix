/* ==========================================================================
   EduMatrix — cart.js
   Renders cart.html from the cart stored in localStorage (see storage.js)
   joined against the shared course data (see courses-data.js). Handles
   removing items, moving an item to the wishlist, and a simple demo
   coupon system.

   Depends on: courses-data.js, storage.js, wishlist.js, main.js (all loaded first)
   ========================================================================== */

/* Demo coupon codes. In a real backend these would be validated
   server-side — here they just demonstrate the UI flow. */
var EM_COUPONS = {
  EDU10: { type: "percent", value: 10, label: "10% off" },
  EDU25: { type: "percent", value: 25, label: "25% off" },
  SAVE20: { type: "flat", value: 20, label: "$20 off" }
};

var cartPageState = {
  appliedCoupon: null
};

document.addEventListener("DOMContentLoaded", function () {
  renderCart();
  bindCouponControl();
});

function renderCart() {
  var cart = getCart();
  var emptyState = document.getElementById("cartEmptyState");
  var content = document.getElementById("cartContent");

  if (cart.length === 0) {
    emptyState.classList.remove("d-none");
    content.classList.add("d-none");
    return;
  }

  emptyState.classList.add("d-none");
  content.classList.remove("d-none");

  var courses = cart
    .map(function (item) { return getCourseById(item.courseId); })
    .filter(Boolean); // drop any ids that no longer exist in the catalog

  document.getElementById("cartItemsList").innerHTML = courses.map(renderCartItemHTML).join("");
  bindCartItemActions();
  updateSummary(courses);
}

function renderCartItemHTML(course) {
  return (
    '<div class="em-cart-item" data-cart-item-id="' + course.id + '">' +
      '<img src="' + course.image + '" alt="' + course.title + ' course cover" class="em-cart-item__thumb" loading="lazy" />' +
      '<div class="flex-grow-1">' +
        '<div class="d-flex justify-content-between align-items-start gap-3">' +
          '<div>' +
            '<h3 class="text-headline-md mb-1" style="font-size: 18px;">' +
              '<a href="course-details.html?id=' + course.id + '" class="text-decoration-none" style="color: inherit;">' + course.title + '</a>' +
            '</h3>' +
            '<p class="text-caption text-muted-em mb-2">' + course.instructor + ' · ' + getCategoryLabel(course.category) + '</p>' +
          '</div>' +
          '<span class="text-headline-md" style="font-size: 18px;">$' + course.price + '</span>' +
        '</div>' +
        '<div class="d-flex gap-3 mt-2">' +
          '<button type="button" class="btn btn-link p-0 text-label-md" style="color: var(--em-secondary); text-decoration: none;" data-move-to-wishlist="' + course.id + '">Move to Wishlist</button>' +
          '<button type="button" class="btn btn-link p-0 text-label-md" style="color: var(--em-error); text-decoration: none;" data-remove-item="' + course.id + '">Remove</button>' +
        '</div>' +
      '</div>' +
    '</div>'
  );
}

function bindCartItemActions() {
  document.querySelectorAll("[data-remove-item]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var courseId = btn.getAttribute("data-remove-item");
      removeFromCart(courseId);
      updateCartCountBadges();
      showToast("Removed from cart");
      renderCart();
    });
  });

  document.querySelectorAll("[data-move-to-wishlist]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var courseId = btn.getAttribute("data-move-to-wishlist");
      removeFromCart(courseId);
      if (!isInWishlist(courseId)) {
        toggleWishlist(courseId);
      }
      updateCartCountBadges();
      updateWishlistCountBadges();
      showToast("Moved to wishlist");
      renderCart();
    });
  });
}

/* --------------------------------------------------------------------------
   SUMMARY + COUPON
   -------------------------------------------------------------------------- */

function updateSummary(courses) {
  var subtotal = courses.reduce(function (sum, course) { return sum + course.price; }, 0);
  var discount = calculateDiscount(subtotal);
  var total = Math.max(0, subtotal - discount);

  document.getElementById("cartSubtotal").textContent = "$" + subtotal.toFixed(2).replace(/\.00$/, "");

  var discountRow = document.getElementById("cartDiscountRow");
  if (discount > 0) {
    document.getElementById("cartDiscount").textContent = "-$" + discount.toFixed(2).replace(/\.00$/, "");
    discountRow.classList.remove("d-none");
  } else {
    discountRow.classList.add("d-none");
  }

  document.getElementById("cartTotal").textContent = "$" + total.toFixed(2).replace(/\.00$/, "");
}

function calculateDiscount(subtotal) {
  if (!cartPageState.appliedCoupon) return 0;
  var coupon = cartPageState.appliedCoupon;
  if (coupon.type === "percent") {
    return Math.round(subtotal * (coupon.value / 100) * 100) / 100;
  }
  return Math.min(subtotal, coupon.value);
}

function bindCouponControl() {
  var applyBtn = document.getElementById("applyCouponBtn");
  var input = document.getElementById("couponInput");

  applyBtn.addEventListener("click", function () {
    var code = input.value.trim().toUpperCase();
    var message = document.getElementById("couponMessage");
    var coupon = EM_COUPONS[code];

    if (!code) {
      message.textContent = "Enter a coupon code first.";
      message.style.color = "var(--em-error)";
      return;
    }

    if (!coupon) {
      cartPageState.appliedCoupon = null;
      message.textContent = "That code isn't valid.";
      message.style.color = "var(--em-error)";
      renderCart();
      return;
    }

    cartPageState.appliedCoupon = coupon;
    message.textContent = "Applied: " + coupon.label;
    message.style.color = "var(--em-primary)";
    renderCart();
  });
}
