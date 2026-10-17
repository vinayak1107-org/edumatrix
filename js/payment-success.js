/* ==========================================================================
   EduMatrix — payment-success.js
   Reads ?order= from the URL, finds the matching order that checkout.js
   saved to localStorage, and renders it. Also enrolls each purchased
   course into edumatrix_progress so dashboard.html / my-courses.html
   have something real to show once they're built.

   Depends on: courses-data.js, storage.js, main.js (all loaded first)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {
  var orderId = new URLSearchParams(window.location.search).get("order");
  var order = findOrder(orderId);

  if (!order) {
    document.getElementById("orderNotFoundState").classList.remove("d-none");
    document.getElementById("successContent").classList.add("d-none");
    return;
  }

  document.getElementById("successContent").classList.remove("d-none");
  renderOrder(order);
  enrollCoursesFromOrder(order);
  updateCartCountBadges(); // cart was cleared by checkout.js — reflect that immediately
});

function findOrder(orderId) {
  if (!orderId) return null;
  var orders = emGetJSON(EDUMATRIX_KEYS.orders, []);
  return orders.find(function (o) { return o.id === orderId; }) || null;
}

var PAYMENT_METHOD_LABELS = {
  card: "Credit / Debit Card",
  upi: "UPI",
  netbanking: "Net Banking",
  wallet: "Wallet"
};

function renderOrder(order) {
  document.getElementById("orderNumber").textContent = order.id;
  document.getElementById("orderDate").textContent = formatOrderDate(order.date);
  document.getElementById("orderPaymentMethod").textContent =
    PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod;
  document.getElementById("orderAmount").textContent = "$" + order.total;

  document.getElementById("orderItemsList").innerHTML = order.items.map(function (item) {
    return (
      '<div class="d-flex align-items-center gap-3">' +
        '<img src="' + item.image + '" alt="' + item.title + '" style="width: 64px; height: 48px; border-radius: var(--em-radius); object-fit: cover;" />' +
        '<div class="flex-grow-1">' +
          '<p class="text-body-md m-0" style="font-weight: 600;">' + item.title + '</p>' +
          '<p class="text-caption text-muted-em m-0">' + item.instructor + '</p>' +
        '</div>' +
        '<span class="text-body-md" style="font-weight: 600;">$' + item.price + '</span>' +
      '</div>'
    );
  }).join("");

  // Deep-link "Start Learning" straight into the first purchased course.
  if (order.items.length > 0) {
    document.getElementById("startLearningBtn").href = "learning.html?id=" + order.items[0].courseId;
  }
}

function formatOrderDate(isoString) {
  var date = new Date(isoString);
  return date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

/**
 * Adds each purchased course to the learner's progress record (if not
 * already enrolled), so dashboard.html and my-courses.html can list it
 * under "Not Started" without the person having to do anything else.
 */
function enrollCoursesFromOrder(order) {
  var progress = emGetJSON(EDUMATRIX_KEYS.progress, []);

  order.items.forEach(function (item) {
    var alreadyEnrolled = progress.some(function (p) { return p.courseId === item.courseId; });
    if (!alreadyEnrolled) {
      progress.push({
        courseId: item.courseId,
        status: "not-started",
        progressPercent: 0,
        enrolledDate: order.date,
        lastLessonIndex: 0
      });
    }
  });

  emSetJSON(EDUMATRIX_KEYS.progress, progress);
}
