/* ==========================================================================
   EduMatrix — instructor-analytics.js
   Renders the revenue trend chart, a revenue-by-category breakdown, and
   a top-performing-courses table, all derived from instructor-data.js.

   Depends on: courses-data.js, storage.js, instructor-data.js (all loaded first)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {
  renderRevenueChart();
  renderCategoryBreakdown();
  renderTopCourses();
});

function renderRevenueChart() {
  var maxAmount = Math.max.apply(null, EM_INSTRUCTOR_MONTHLY_REVENUE.map(function (m) { return m.amount; }));

  document.getElementById("analyticsRevenueChart").innerHTML = EM_INSTRUCTOR_MONTHLY_REVENUE.map(function (entry) {
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

function renderCategoryBreakdown() {
  var courses = getInstructorCourses();
  var totalsByCategory = {};

  courses.forEach(function (course) {
    totalsByCategory[course.category] = (totalsByCategory[course.category] || 0) + course.revenue;
  });

  var entries = Object.keys(totalsByCategory)
    .map(function (slug) { return { slug: slug, amount: totalsByCategory[slug] }; })
    .filter(function (entry) { return entry.amount > 0; })
    .sort(function (a, b) { return b.amount - a.amount; });

  var maxAmount = entries.length ? entries[0].amount : 1;

  document.getElementById("categoryBreakdown").innerHTML = entries.map(function (entry) {
    var widthPercent = Math.round((entry.amount / maxAmount) * 100);
    return (
      '<div class="em-hbar-row">' +
        '<span class="em-hbar-row__label">' + getCategoryLabel(entry.slug) + '</span>' +
        '<div class="em-hbar-row__track"><div class="em-hbar-row__fill" style="width: ' + widthPercent + '%;"></div></div>' +
        '<span class="em-hbar-row__value">$' + Math.round(entry.amount / 1000) + 'k</span>' +
      '</div>'
    );
  }).join("") || '<p class="text-body-md text-muted-em m-0">No revenue yet — publish a course to see this breakdown.</p>';
}

function renderTopCourses() {
  var courses = getInstructorCourses()
    .filter(function (c) { return c.status === "published"; })
    .sort(function (a, b) { return b.revenue - a.revenue; });

  document.getElementById("topCoursesBody").innerHTML = courses.map(function (course) {
    return (
      '<tr>' +
        '<td>' +
          '<div class="d-flex align-items-center gap-3">' +
            '<img src="' + course.image + '" alt="" style="width: 56px; height: 40px; border-radius: var(--em-radius); object-fit: cover;" />' +
            '<span style="font-weight: 600;">' + course.title + '</span>' +
          '</div>' +
        '</td>' +
        '<td>' + course.students.toLocaleString() + '</td>' +
        '<td>' + course.rating.toFixed(1) + '</td>' +
        '<td>$' + course.revenue.toLocaleString() + '</td>' +
      '</tr>'
    );
  }).join("");
}
