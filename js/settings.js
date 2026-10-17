/* ==========================================================================
   EduMatrix — settings.js
   Handles the settings page's guest guard, notification preference
   toggles (persisted to localStorage), logout, and the demo "delete
   account" flow. Dark mode itself is handled by main.js's
   initThemeToggle() via the [data-em-theme-toggle] switch already in
   settings.html — this file only covers what's specific to this page.

   Depends on: storage.js, auth.js (both loaded first)
   ========================================================================== */

var EM_NOTIFICATION_PREFS_KEY = "edumatrix_notification_prefs";

document.addEventListener("DOMContentLoaded", function () {
  if (!getCurrentUser()) {
    document.getElementById("settingsGuestState").classList.remove("d-none");
    document.getElementById("settingsContent").classList.add("d-none");
    return;
  }

  document.getElementById("settingsContent").classList.remove("d-none");
  loadNotificationPrefs();
  bindNotificationToggles();
  bindAccountActions();
});

function loadNotificationPrefs() {
  var prefs = emGetJSON(EM_NOTIFICATION_PREFS_KEY, {
    courseUpdates: true,
    orders: true,
    recommendations: false
  });

  document.getElementById("notifyCourseUpdates").checked = prefs.courseUpdates;
  document.getElementById("notifyOrders").checked = prefs.orders;
  document.getElementById("notifyRecommendations").checked = prefs.recommendations;
}

function bindNotificationToggles() {
  ["notifyCourseUpdates", "notifyOrders", "notifyRecommendations"].forEach(function (id) {
    document.getElementById(id).addEventListener("change", saveNotificationPrefs);
  });
}

function saveNotificationPrefs() {
  var prefs = {
    courseUpdates: document.getElementById("notifyCourseUpdates").checked,
    orders: document.getElementById("notifyOrders").checked,
    recommendations: document.getElementById("notifyRecommendations").checked
  };

  emSetJSON(EM_NOTIFICATION_PREFS_KEY, prefs);

  var note = document.getElementById("settingsSavedNote");
  note.style.display = "block";
  window.setTimeout(function () { note.style.display = "none"; }, 2000);
}

function bindAccountActions() {
  document.getElementById("settingsLogoutBtn").addEventListener("click", logoutUser);

  document.getElementById("deleteAccountBtn").addEventListener("click", function () {
    var confirmed = window.confirm(
      "This will permanently delete your demo account and all locally stored data (cart, wishlist, progress, orders). This can't be undone. Continue?"
    );
    if (!confirmed) return;

    // Demo-scoped wipe: clears everything this app stores in this
    // browser, not just the account record, since none of it is tied
    // to a real backend the person could recover it from.
    Object.keys(EDUMATRIX_KEYS).forEach(function (key) {
      localStorage.removeItem(EDUMATRIX_KEYS[key]);
    });
    localStorage.removeItem(EM_NOTIFICATION_PREFS_KEY);

    window.location.href = "index.html";
  });
}
