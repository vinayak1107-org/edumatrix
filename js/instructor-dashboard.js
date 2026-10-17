/* ==========================================================================
   EduMatrix — instructor-dashboard.js
   Renders stats, a simple CSS bar chart of the last 6 months of revenue,
   and a recent activity feed for the instructor dashboard.

   Depends on: courses-data.js, storage.js, instructor-data.js (all loaded first)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {
  renderStats();
  renderRevenueChart();
  renderActivity();
});

function renderStats() {
  var stats = getInstructorStats();
  document.getElementById("statRevenue").textContent = "$" + stats.totalRevenue.toLocaleString();
  document.getElementById("statStudents").textContent = stats.totalStudents.toLocaleString();
  document.getElementById("statCourses").textContent = stats.publishedCourses;
  document.getElementById("statRating").textContent = stats.avgRating.toFixed(1);
}

function renderRevenueChart() {
  var maxAmount = Math.max.apply(null, EM_INSTRUCTOR_MONTHLY_REVENUE.map(function (m) { return m.amount; }));

  document.getElementById("revenueChart").innerHTML = EM_INSTRUCTOR_MONTHLY_REVENUE.map(function (entry) {
    var heightPercent = Math.round((entry.amount / maxAmount) * 100);
    return (
      '<div class="em-bar-chart__col">' +
        '<span class="text-caption text-muted-em mb-2">$' + Math.round(entry.amount / 1000) + 'k</span>' +
        '<div class="em-bar-chart__bar" style="height: ' + heightPercent + '%;" role="img" aria-label="' + entry.month + ': $' + entry.amount.toLocaleString() + '"></div>' +
        '<span class="text-caption text-muted-em mt-2">' + entry.month + '</span>' +
      '</div>'
    );
  }).join("");
}

function renderActivity() {
  var courses = getInstructorCourses();
  var events = courses
    .filter(function (c) { return c.status === "published"; })
    .map(function (c) {
      return {
        date: c.createdDate,
        icon: "school",
        text: c.students.toLocaleString() + " students enrolled in " + c.title
      };
    })
    .concat(courses.map(function (c) {
      return {
        date: c.createdDate,
        icon: c.status === "published" ? "publish" : "edit_note",
        text: (c.status === "published" ? "Published " : "Saved draft: ") + c.title
      };
    }))
    .sort(function (a, b) { return new Date(b.date) - new Date(a.date); })
    .slice(0, 6);

  document.getElementById("instructorActivityList").innerHTML = events.map(function (event) {
    return (
      '<li class="d-flex align-items-center gap-3 py-3" style="border-bottom: 1px solid var(--em-outline-variant);">' +
        '<span class="material-symbols-outlined" style="color: var(--em-primary);" aria-hidden="true">' + event.icon + '</span>' +
        '<span class="text-body-md flex-grow-1">' + event.text + '</span>' +
      '</li>'
    );
  }).join("");
}
