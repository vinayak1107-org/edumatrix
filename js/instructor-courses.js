/* ==========================================================================
   EduMatrix — instructor-courses.js
   Renders the instructor's course table (seed courses + anything created
   via create-course.html) and handles deleting a created course.

   Depends on: courses-data.js, storage.js, instructor-data.js (all loaded first)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {
  renderInstructorCoursesTable();
});

function renderInstructorCoursesTable() {
  var courses = getInstructorCourses();
  var tbody = document.getElementById("instructorCoursesBody");
  var emptyState = document.getElementById("instructorCoursesEmpty");

  if (courses.length === 0) {
    tbody.innerHTML = "";
    emptyState.classList.remove("d-none");
    return;
  }

  emptyState.classList.add("d-none");
  tbody.innerHTML = courses.map(renderInstructorCourseRow).join("");
  bindDeleteButtons();
}

function renderInstructorCourseRow(course) {
  var statusClass = course.status === "published" ? "em-status-badge--published" : "em-status-badge--draft";
  var isCreatedByUser = String(course.id).indexOf("instr-") === 0 && !EM_INSTRUCTOR_SEED_COURSES.some(function (c) { return c.id === course.id; });

  return (
    '<tr>' +
      '<td>' +
        '<div class="d-flex align-items-center gap-3">' +
          '<img src="' + course.image + '" alt="" style="width: 56px; height: 40px; border-radius: var(--em-radius); object-fit: cover;" />' +
          '<span style="font-weight: 600;">' + course.title + '</span>' +
        '</div>' +
      '</td>' +
      '<td><span class="em-status-badge ' + statusClass + '">' + course.status + '</span></td>' +
      '<td>' + course.students.toLocaleString() + '</td>' +
      '<td>' + (course.rating ? course.rating.toFixed(1) : "—") + '</td>' +
      '<td>$' + course.revenue.toLocaleString() + '</td>' +
      '<td class="text-end">' +
        '<button type="button" class="btn btn-link p-0 text-label-md me-3" style="color: var(--em-secondary); text-decoration: none;" data-edit-course="' + course.id + '">Edit</button>' +
        (isCreatedByUser
          ? '<button type="button" class="btn btn-link p-0 text-label-md" style="color: var(--em-error); text-decoration: none;" data-delete-course="' + course.id + '">Delete</button>'
          : '<span class="text-caption text-muted-em">Sample data</span>') +
      '</td>' +
    '</tr>'
  );
}

function bindDeleteButtons() {
  document.querySelectorAll("[data-delete-course]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var courseId = btn.getAttribute("data-delete-course");
      if (!window.confirm("Delete this course? This can't be undone.")) return;
      deleteInstructorCourse(courseId);
      renderInstructorCoursesTable();
    });
  });

  document.querySelectorAll("[data-edit-course]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      // Full inline editing is out of scope for this demo — create-course.html
      // covers authoring new courses. Wiring this up to pre-fill that form
      // would be the natural next step.
      window.alert("Editing an existing course isn't available in this demo yet. You can create a new course from the Create Course page.");
    });
  });
}
