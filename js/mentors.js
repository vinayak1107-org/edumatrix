/* ==========================================================================
   EduMatrix — mentors.js
   Renders the mentor grid from EDUMATRIX_MENTORS (mentors-data.js) with
   a simple expertise filter.

   Depends on: courses-data.js, mentors-data.js (both loaded first)
   ========================================================================== */

var mentorsPageState = {
  activeExpertise: "all"
};

document.addEventListener("DOMContentLoaded", function () {
  renderExpertiseFilters();
  renderMentorsGrid();
});

function renderExpertiseFilters() {
  var container = document.getElementById("expertiseFilters");
  var chips = [{ slug: "all", label: "All" }].concat(EDUMATRIX_CATEGORIES);

  container.innerHTML = chips.map(function (chip) {
    var isActive = mentorsPageState.activeExpertise === chip.slug;
    return (
      '<button type="button" class="' + (isActive ? "btn-em-primary" : "btn-em-secondary") + '" data-expertise-chip="' + chip.slug + '" style="padding: 8px 18px; min-height: 40px;">' +
        chip.label +
      '</button>'
    );
  }).join("");

  container.querySelectorAll("[data-expertise-chip]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      mentorsPageState.activeExpertise = btn.getAttribute("data-expertise-chip");
      renderExpertiseFilters();
      renderMentorsGrid();
    });
  });
}

function renderMentorsGrid() {
  var mentors = EDUMATRIX_MENTORS.filter(function (mentor) {
    return mentorsPageState.activeExpertise === "all" ||
      mentor.expertise.indexOf(mentorsPageState.activeExpertise) !== -1;
  });

  document.getElementById("mentorsGrid").innerHTML = mentors.map(renderMentorCardHTML).join("");
}

function renderMentorCardHTML(mentor) {
  var tags = mentor.expertise.map(function (slug) {
    return '<span class="em-mentor-card__tag">' + getCategoryLabel(slug) + '</span>';
  }).join("");

  var courseCount = getCoursesByMentor(mentor.name).length;

  return (
    '<div class="col-12 col-sm-6 col-lg-4">' +
      '<div class="em-mentor-card shadow-em-1">' +
        '<img src="' + mentor.image + '" alt="Portrait of ' + mentor.name + '" class="em-mentor-card__avatar" loading="lazy" />' +
        '<h2 class="text-headline-md mb-1" style="font-size: 20px;">' + mentor.name + '</h2>' +
        '<p class="text-body-md text-muted-em mb-3">' + mentor.title + '</p>' +
        '<div class="mb-3">' + tags + '</div>' +
        '<div class="d-flex justify-content-center gap-3 mb-4 text-caption text-muted-em">' +
          '<span><span class="material-symbols-outlined icon-fill" style="font-size: 14px; color: var(--em-primary); vertical-align: -2px;" aria-hidden="true">star</span> ' + mentor.rating.toFixed(1) + '</span>' +
          '<span>' + formatCount(mentor.students) + ' students</span>' +
          '<span>' + courseCount + ' course' + (courseCount === 1 ? "" : "s") + '</span>' +
        '</div>' +
        '<a href="mentor-profile.html?id=' + mentor.id + '" class="btn-em-secondary w-100">View Profile</a>' +
      '</div>' +
    '</div>'
  );
}
