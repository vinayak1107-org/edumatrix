/* ==========================================================================
   EduMatrix — certificates.js
   Renders one certificate per completed course (edumatrix_progress
   entries with status "completed"). Download uses the browser's print
   dialog — a real backend would generate a PDF instead, but the visual
   output is the same "print-friendly certificate" the brief asks for.

   Depends on: courses-data.js, storage.js, auth.js (all loaded first)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {
  var user = getCurrentUser();

  if (!user) {
    document.getElementById("certGuestState").classList.remove("d-none");
    document.getElementById("certContent").classList.add("d-none");
    return;
  }

  document.getElementById("certContent").classList.remove("d-none");
  renderCertificates(user);
});

function renderCertificates(user) {
  var progress = emGetJSON(EDUMATRIX_KEYS.progress, []);
  var completed = progress.filter(function (p) { return p.status === "completed"; });

  var list = document.getElementById("certificatesList");
  var emptyState = document.getElementById("certEmptyState");

  if (completed.length === 0) {
    list.innerHTML = "";
    emptyState.classList.remove("d-none");
    return;
  }

  emptyState.classList.add("d-none");
  list.innerHTML = completed.map(function (entry) {
    var course = getCourseById(entry.courseId);
    if (!course) return "";
    return renderCertificateHTML(user, course, entry);
  }).join("");

  bindDownloadButtons();
}

function renderCertificateHTML(user, course, entry) {
  var certId = "cert-" + course.id;
  return (
    '<div class="em-certificate" id="' + certId + '">' +
      '<div class="em-certificate__seal">' +
        '<span class="material-symbols-outlined icon-fill" style="font-size: 32px;" aria-hidden="true">workspace_premium</span>' +
      '</div>' +
      '<p class="text-label-md text-muted-em text-uppercase mb-2" style="letter-spacing: 0.1em;">Certificate of Completion</p>' +
      '<h2 class="text-headline-lg mb-3">' + escapeHTML(user.name || "Student") + '</h2>' +
      '<p class="text-body-lg text-muted-em mb-1">has successfully completed</p>' +
      '<h3 class="text-headline-md mb-4">' + course.title + '</h3>' +
      '<p class="text-body-md text-muted-em mb-4">Instructed by ' + course.instructor + ' · Completed ' + formatCertDate(entry.enrolledDate) + '</p>' +
      '<button type="button" class="btn-em-primary em-no-print" data-download-cert="' + certId + '">' +
        '<span class="material-symbols-outlined" style="font-size: 18px;" aria-hidden="true">download</span> Download Certificate' +
      '</button>' +
    '</div>'
  );
}

function bindDownloadButtons() {
  document.querySelectorAll("[data-download-cert]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      // Frontend-demo "download": the print dialog lets the learner save
      // as PDF, which is the closest equivalent without a backend to
      // generate and host a real file.
      window.print();
    });
  });
}

function formatCertDate(isoString) {
  var date = new Date(isoString);
  return date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}
