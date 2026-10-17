/* ==========================================================================
   EduMatrix — notifications.js
   Renders the notification feed from edumatrix_notifications, seeding a
   realistic starter set the first time a logged-in person visits (using
   their real order/progress history where possible, per the project's
   example notification types).

   Depends on: storage.js, auth.js (both loaded first)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {
  if (!getCurrentUser()) {
    document.getElementById("notifGuestState").classList.remove("d-none");
    document.getElementById("notifContent").classList.add("d-none");
    return;
  }

  document.getElementById("notifContent").classList.remove("d-none");
  ensureSeededNotifications();
  renderNotifications();
  document.getElementById("clearAllBtn").addEventListener("click", clearAllNotifications);
});

/**
 * Seeds a starter set of notifications the first time this key is
 * empty, mixing generic examples with anything real we can infer from
 * orders/progress already in localStorage (so it doesn't feel entirely
 * fake for someone who's gone through the purchase flow).
 */
function ensureSeededNotifications() {
  var existing = emGetJSON(EDUMATRIX_KEYS.notifications, null);
  if (existing !== null) return; // already seeded (or intentionally cleared) — leave as-is

  var seeded = [];
  var orders = emGetJSON(EDUMATRIX_KEYS.orders, []);
  var progress = emGetJSON(EDUMATRIX_KEYS.progress, []);

  orders.forEach(function (order) {
    seeded.push({
      id: "order-" + order.id,
      icon: "payments",
      title: "Payment successful",
      body: "Your order " + order.id + " for $" + order.total + " was processed successfully.",
      date: order.date,
      read: false
    });
  });

  progress.filter(function (p) { return p.status === "completed"; }).forEach(function (p) {
    var course = getCourseById ? getCourseById(p.courseId) : null;
    seeded.push({
      id: "cert-" + p.courseId,
      icon: "workspace_premium",
      title: "Certificate available",
      body: "Your certificate for " + (course ? course.title : "a completed course") + " is ready to download.",
      date: p.enrolledDate,
      read: false
    });
  });

  // Generic examples so the page never looks empty on a fresh account.
  seeded.push({
    id: "generic-recommendation",
    icon: "auto_awesome",
    title: "New course recommendation",
    body: "Based on your activity, you might like \"Machine Learning Foundations.\"",
    date: new Date(Date.now() - 2 * 86400000).toISOString(),
    read: true
  });
  seeded.push({
    id: "generic-mentor",
    icon: "campaign",
    title: "Mentor update",
    body: "S. Chen just added new lessons to \"Editorial UI Systems.\"",
    date: new Date(Date.now() - 5 * 86400000).toISOString(),
    read: true
  });

  seeded.sort(function (a, b) { return new Date(b.date) - new Date(a.date); });
  emSetJSON(EDUMATRIX_KEYS.notifications, seeded);
}

function renderNotifications() {
  var notifications = emGetJSON(EDUMATRIX_KEYS.notifications, []);
  var list = document.getElementById("notificationsList");
  var emptyState = document.getElementById("notifEmptyState");

  if (notifications.length === 0) {
    list.innerHTML = "";
    emptyState.classList.remove("d-none");
    return;
  }

  emptyState.classList.add("d-none");
  list.innerHTML = notifications.map(renderNotificationHTML).join("");
  bindNotificationClicks();
}

function renderNotificationHTML(notification) {
  return (
    '<div class="em-notification' + (notification.read ? "" : " is-unread") + '" data-notification-id="' + notification.id + '" role="button" tabindex="0">' +
      '<div class="em-notification__icon">' +
        '<span class="material-symbols-outlined icon-fill" aria-hidden="true">' + notification.icon + '</span>' +
      '</div>' +
      '<div class="flex-grow-1">' +
        '<p class="text-body-md m-0" style="font-weight: 600;">' + notification.title + '</p>' +
        '<p class="text-body-md text-muted-em m-0 mb-1">' + notification.body + '</p>' +
        '<p class="text-caption text-muted-em m-0">' + formatNotificationDate(notification.date) + '</p>' +
      '</div>' +
    '</div>'
  );
}

function bindNotificationClicks() {
  document.querySelectorAll("[data-notification-id]").forEach(function (el) {
    el.addEventListener("click", function () {
      markNotificationRead(el.getAttribute("data-notification-id"));
    });
  });
}

function markNotificationRead(id) {
  var notifications = emGetJSON(EDUMATRIX_KEYS.notifications, []);
  var notification = notifications.find(function (n) { return n.id === id; });
  if (notification && !notification.read) {
    notification.read = true;
    emSetJSON(EDUMATRIX_KEYS.notifications, notifications);
    renderNotifications();
  }
}

function clearAllNotifications() {
  emSetJSON(EDUMATRIX_KEYS.notifications, []);
  renderNotifications();
}

function formatNotificationDate(isoString) {
  var date = new Date(isoString);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
