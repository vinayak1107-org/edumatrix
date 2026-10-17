/* ==========================================================================
   EduMatrix — dashboard.js
   Renders dashboard.html entirely from local data: the demo session
   (auth.js), enrolled-course progress (edumatrix_progress, written by
   payment-success.js), and past orders (edumatrix_orders).

   Uses a "soft" auth guard: rather than force-redirecting a signed-out
   visitor away from the page, it shows an inline "Log in to continue"
   state. This keeps the page easy to preview/demo without a session,
   while still respecting the auth state everywhere it matters.

   Depends on: courses-data.js, storage.js, auth.js (all loaded first)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {
  var user = getCurrentUser();

  if (!user) {
    document.getElementById("dashboardGuestState").classList.remove("d-none");
    document.getElementById("dashboardContent").classList.add("d-none");
    return;
  }

  document.getElementById("dashboardContent").classList.remove("d-none");
  document.getElementById("dashboardUserName").textContent = firstName(user.name);

  var progress = emGetJSON(EDUMATRIX_KEYS.progress, []);
  renderStats(progress);
  renderContinueLearning(progress);
  renderEnrolledCourses(progress);
  renderRecommendedCourses(progress);
  renderRecentActivity(progress);
});

/* --------------------------------------------------------------------------
   STATS
   -------------------------------------------------------------------------- */

function renderStats(progress) {
  var completed = progress.filter(function (p) { return p.status === "completed"; });

  document.getElementById("statEnrolled").textContent = progress.length;
  document.getElementById("statCompleted").textContent = completed.length;
  document.getElementById("statCertificates").textContent = completed.length;
  document.getElementById("statHours").textContent = estimateLearningHours(progress) + "h";
}

/**
 * Rough estimate: total course duration × how far along the learner is.
 * Good enough for a dashboard stat tile in a frontend demo.
 */
function estimateLearningHours(progress) {
  var totalMinutes = progress.reduce(function (sum, p) {
    var course = getCourseById(p.courseId);
    if (!course) return sum;
    var courseMinutes = parseDurationToMinutes(course.duration);
    return sum + courseMinutes * (p.progressPercent / 100);
  }, 0);
  return Math.round(totalMinutes / 60);
}

function parseDurationToMinutes(duration) {
  var hoursMatch = duration.match(/(\d+)h/);
  var minutesMatch = duration.match(/(\d+)m/);
  var hours = hoursMatch ? Number(hoursMatch[1]) : 0;
  var minutes = minutesMatch ? Number(minutesMatch[1]) : 0;
  return hours * 60 + minutes;
}

/* --------------------------------------------------------------------------
   CONTINUE LEARNING
   -------------------------------------------------------------------------- */

function renderContinueLearning(progress) {
  var inProgress = progress
    .filter(function (p) { return p.status === "in-progress"; })
    .sort(function (a, b) { return new Date(b.enrolledDate) - new Date(a.enrolledDate); });

  var section = document.getElementById("continueLearningSection");
  if (inProgress.length === 0) {
    section.classList.add("d-none");
    return;
  }

  var entry = inProgress[0];
  var course = getCourseById(entry.courseId);
  if (!course) {
    section.classList.add("d-none");
    return;
  }

  section.classList.remove("d-none");
  document.getElementById("continueLearningImage").src = course.image;
  document.getElementById("continueLearningImage").alt = course.title;
  document.getElementById("continueLearningCategory").textContent = getCategoryLabel(course.category);
  document.getElementById("continueLearningTitle").textContent = course.title;
  document.getElementById("continueLearningProgressBar").style.width = entry.progressPercent + "%";
  document.getElementById("continueLearningProgressText").textContent = entry.progressPercent + "% complete";
  document.getElementById("continueLearningBtn").href = "learning.html?id=" + course.id;
}

/* --------------------------------------------------------------------------
   ENROLLED COURSES
   -------------------------------------------------------------------------- */

function renderEnrolledCourses(progress) {
  var grid = document.getElementById("enrolledCoursesGrid");
  var emptyState = document.getElementById("enrolledCoursesEmpty");

  var courses = progress
    .map(function (p) { return getCourseById(p.courseId); })
    .filter(Boolean)
    .slice(0, 3); // dashboard shows a preview; my-courses.html shows the full list

  if (courses.length === 0) {
    grid.classList.add("d-none");
    emptyState.classList.remove("d-none");
    return;
  }

  grid.classList.remove("d-none");
  emptyState.classList.add("d-none");
  grid.innerHTML = courses.map(renderCourseCardHTML).join("");
  initWishlistButtons();
}

/* --------------------------------------------------------------------------
   RECOMMENDED COURSES
   -------------------------------------------------------------------------- */

function renderRecommendedCourses(progress) {
  var enrolledIds = progress.map(function (p) { return p.courseId; });
  var recommended = EDUMATRIX_COURSES
    .filter(function (c) { return enrolledIds.indexOf(c.id) === -1; })
    .sort(function (a, b) { return b.rating - a.rating; })
    .slice(0, 3);

  document.getElementById("recommendedCoursesGrid").innerHTML = recommended.map(renderCourseCardHTML).join("");
  initWishlistButtons();
}

/* --------------------------------------------------------------------------
   RECENT ACTIVITY
   -------------------------------------------------------------------------- */

function renderRecentActivity(progress) {
  var orders = emGetJSON(EDUMATRIX_KEYS.orders, []);
  var events = [];

  orders.forEach(function (order) {
    events.push({
      date: order.date,
      icon: "shopping_bag",
      text: "Purchased " + order.items.length + (order.items.length === 1 ? " course" : " courses") + " (Order " + order.id + ")"
    });
  });

  progress.forEach(function (p) {
    var course = getCourseById(p.courseId);
    if (!course) return;
    events.push({
      date: p.enrolledDate,
      icon: "school",
      text: "Enrolled in " + course.title
    });
    if (p.status === "completed") {
      events.push({
        date: p.enrolledDate,
        icon: "workspace_premium",
        text: "Completed " + course.title + " — certificate ready"
      });
    }
  });

  events.sort(function (a, b) { return new Date(b.date) - new Date(a.date); });
  events = events.slice(0, 6);

  var list = document.getElementById("recentActivityList");
  var emptyState = document.getElementById("recentActivityEmpty");

  if (events.length === 0) {
    list.innerHTML = "";
    emptyState.classList.remove("d-none");
    return;
  }

  emptyState.classList.add("d-none");
  list.innerHTML = events.map(function (event) {
    return (
      '<li class="d-flex align-items-center gap-3 py-3" style="border-bottom: 1px solid var(--em-outline-variant);">' +
        '<span class="material-symbols-outlined" style="color: var(--em-primary);" aria-hidden="true">' + event.icon + '</span>' +
        '<span class="text-body-md flex-grow-1">' + event.text + '</span>' +
        '<span class="text-caption text-muted-em">' + formatRelativeDate(event.date) + '</span>' +
      '</li>'
    );
  }).join("");
}

function formatRelativeDate(isoString) {
  var date = new Date(isoString);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
