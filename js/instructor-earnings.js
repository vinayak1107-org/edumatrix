/* ==========================================================================
   EduMatrix — instructor-earnings.js
   Renders balance/earnings stats, revenue-by-course, and payout history.
   "Request Payout" is a frontend simulation: it moves the current
   available balance into a new pending payout row and persists that to
   localStorage so it survives a reload. No real money moves — there is
   no backend or payment processor behind this.

   Depends on: courses-data.js, storage.js, instructor-data.js (all loaded first)
   ========================================================================== */

var EM_PAYOUT_HISTORY_SEED = [
  { date: "2026-07-01", amount: 12400, method: "Bank Transfer", status: "Paid" },
  { date: "2026-06-01", amount: 10800, method: "Bank Transfer", status: "Paid" },
  { date: "2026-05-01", amount: 9200, method: "Bank Transfer", status: "Paid" }
];

document.addEventListener("DOMContentLoaded", function () {
  renderBalance();
  renderRevenueByCourse();
  renderPayoutHistory();
  bindRequestPayout();
});

function getPayoutHistory() {
  var stored = emGetJSON(EDUMATRIX_KEYS.instructorPayouts, null);
  return stored || EM_PAYOUT_HISTORY_SEED.slice();
}

function savePayoutHistory(history) {
  emSetJSON(EDUMATRIX_KEYS.instructorPayouts, history);
}

function renderBalance() {
  var stats = getInstructorStats();
  var history = getPayoutHistory();
  var paidOut = history
    .filter(function (p) { return p.status === "Paid"; })
    .reduce(function (sum, p) { return sum + p.amount; }, 0);
  var pending = history
    .filter(function (p) { return p.status === "Pending"; })
    .reduce(function (sum, p) { return sum + p.amount; }, 0);

  var availableBalance = Math.max(0, stats.totalRevenue - paidOut - pending);

  document.getElementById("availableBalance").textContent = "$" + availableBalance.toLocaleString();
  document.getElementById("lifetimeEarnings").textContent = "$" + stats.totalRevenue.toLocaleString();
  document.getElementById("pendingPayout").textContent = "$" + pending.toLocaleString();
}

function renderRevenueByCourse() {
  var courses = getInstructorCourses().filter(function (c) { return c.status === "published"; });

  document.getElementById("revenueByCourseBody").innerHTML = courses.map(function (course) {
    return (
      '<tr>' +
        '<td>' +
          '<div class="d-flex align-items-center gap-3">' +
            '<img src="' + course.image + '" alt="" style="width: 56px; height: 40px; border-radius: var(--em-radius); object-fit: cover;" />' +
            '<span style="font-weight: 600;">' + course.title + '</span>' +
          '</div>' +
        '</td>' +
        '<td>$' + course.price + '</td>' +
        '<td>' + course.students.toLocaleString() + '</td>' +
        '<td>$' + course.revenue.toLocaleString() + '</td>' +
      '</tr>'
    );
  }).join("");
}

function renderPayoutHistory() {
  var history = getPayoutHistory().slice().sort(function (a, b) { return new Date(b.date) - new Date(a.date); });

  document.getElementById("payoutHistoryBody").innerHTML = history.map(function (payout) {
    var statusClass = payout.status === "Paid" ? "em-status-badge--published" : "em-status-badge--draft";
    return (
      '<tr>' +
        '<td>' + formatPayoutDate(payout.date) + '</td>' +
        '<td>$' + payout.amount.toLocaleString() + '</td>' +
        '<td>' + payout.method + '</td>' +
        '<td><span class="em-status-badge ' + statusClass + '">' + payout.status + '</span></td>' +
      '</tr>'
    );
  }).join("");
}

function bindRequestPayout() {
  document.getElementById("requestPayoutBtn").addEventListener("click", function () {
    var availableText = document.getElementById("availableBalance").textContent;
    var availableAmount = Number(availableText.replace(/[$,]/g, ""));

    var message = document.getElementById("payoutMessage");

    if (availableAmount <= 0) {
      message.textContent = "No available balance to pay out right now.";
      message.style.color = "var(--em-error)";
      message.style.display = "block";
      return;
    }

    var history = getPayoutHistory();
    history.unshift({
      date: new Date().toISOString(),
      amount: availableAmount,
      method: "Bank Transfer",
      status: "Pending"
    });
    savePayoutHistory(history);

    message.textContent = "Payout of $" + availableAmount.toLocaleString() + " requested — funds typically arrive in 3–5 business days.";
    message.style.color = "var(--em-primary)";
    message.style.display = "block";

    renderBalance();
    renderPayoutHistory();
  });
}

function formatPayoutDate(isoString) {
  var date = new Date(isoString);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
