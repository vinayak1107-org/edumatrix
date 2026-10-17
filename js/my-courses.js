/* ==========================================================================
   EduMatrix — my-courses.js
   Renders the tabbed My Courses page from edumatrix_progress joined
   against the shared course catalog.

   Depends on: courses-data.js, storage.js, auth.js (all loaded first)
   ========================================================================== */

var myCoursesState = {
  activeTab: "in-progress"
};

document.addEventListener("DOMContentLoaded", function () {
  if (!getCurrentUser()) {
    document.getElementById("myCoursesGuestState").classList.remove("d-none");
    document.getElementById("myCoursesContent").classList.add("d-none");
    return;
  }

  document.getElementById("myCoursesContent").classList.remove("d-none");
  bindTabs();
  renderMyCourses();
});

function bindTabs() {
  document.querySelectorAll("[data-tab]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      myCoursesState.activeTab = btn.getAttribute("data-tab");
      document.querySelectorAll("[data-tab]").forEach(function (b) {
        b.classList.toggle("is-active", b === btn);
      });
      renderMyCourses();
    });
  });
}

function renderMyCourses() {
  var progress = emGetJSON(EDUMATRIX_KEYS.progress, []);
  var filtered = progress.filter(function (p) { return p.status === myCoursesState.activeTab; });

  var grid = document.getElementById("myCoursesGrid");
  var emptyState = document.getElementById("myCoursesEmpty");
  var emptyText = document.getElementById("myCoursesEmptyText");

  if (filtered.length === 0) {
    grid.innerHTML = "";
    grid.classList.add("d-none");
    emptyState.classList.remove("d-none");
    emptyText.textContent = {
      "in-progress": "You don't have any courses in progress.",
      "completed": "You haven't completed any courses yet.",
      "not-started": "No courses waiting to be started."
    }[myCoursesState.activeTab];
    return;
  }

  grid.classList.remove("d-none");
  emptyState.classList.add("d-none");
  grid.innerHTML = filtered.map(renderMyCourseCard).join("");
}

function renderMyCourseCard(entry) {
  var course = getCourseById(entry.courseId);
  if (!course) return "";

  var actionLabel = { "in-progress": "Resume", "completed": "Review", "not-started": "Start Course" }[entry.status];

  return (
    '<div class="col-12 col-sm-6 col-lg-4">' +
      '<div class="em-my-course-card shadow-em-1">' +
        '<div class="em-my-course-card__media">' +
          '<img src="' + course.image + '" alt="' + course.title + '" loading="lazy" />' +
        '</div>' +
        '<div class="p-4">' +
          '<p class="text-caption text-muted-em mb-1">' + getCategoryLabel(course.category) + '</p>' +
          '<h3 class="text-headline-md mb-3" style="font-size: 18px;">' + course.title + '</h3>' +
          '<div class="em-progress-track mb-2"><div class="em-progress-fill" style="width: ' + entry.progressPercent + '%;"></div></div>' +
          '<p class="text-caption text-muted-em mb-3">' + entry.progressPercent + '% complete</p>' +
          '<a href="learning.html?id=' + course.id + '" class="btn-em-primary w-100">' + actionLabel + '</a>' +
        '</div>' +
      '</div>' +
    '</div>'
  );
}
