/* ==========================================================================
   EduMatrix — about.js
   Renders the About page's team section from the same mentor data used
   on mentors.html, so the two pages never disagree.

   Depends on: mentors-data.js (loaded first)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {
  var grid = document.getElementById("aboutTeamGrid");

  grid.innerHTML = EDUMATRIX_MENTORS.map(function (mentor) {
    return (
      '<div class="col-12 col-sm-6 col-lg-4">' +
        '<a href="mentor-profile.html?id=' + mentor.id + '" class="d-flex flex-column align-items-center text-center text-decoration-none shadow-em-1 rounded-4 p-4 h-100" style="border-radius: var(--em-radius-xl); color: inherit;">' +
          '<img src="' + mentor.image + '" alt="Portrait of ' + mentor.name + '" class="em-team-avatar mb-3" loading="lazy" />' +
          '<h3 class="text-headline-md mb-1" style="font-size: 18px;">' + mentor.name + '</h3>' +
          '<p class="text-body-md text-muted-em m-0">' + mentor.title + '</p>' +
        '</a>' +
      '</div>'
    );
  }).join("");
});
