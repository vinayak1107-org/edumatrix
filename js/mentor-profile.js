/* ==========================================================================
   EduMatrix — mentor-profile.js
   Reads ?id= from the URL and renders the matching mentor's profile,
   including their real course listings from courses-data.js.

   Depends on: courses-data.js, mentors-data.js, wishlist.js (all loaded first)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {
  var mentorId = new URLSearchParams(window.location.search).get("id");
  var mentor = getMentorById(mentorId);

  if (!mentor) {
    document.getElementById("notFoundState").classList.remove("d-none");
    document.getElementById("mentorProfileContent").classList.add("d-none");
    return;
  }

  renderMentorProfile(mentor);
});

function renderMentorProfile(mentor) {
  document.getElementById("mentorProfileContent").classList.remove("d-none");
  document.title = mentor.name + " | EduMatrix Mentors";

  document.getElementById("breadcrumbMentorName").textContent = mentor.name;
  document.getElementById("mentorImage").src = mentor.image;
  document.getElementById("mentorImage").alt = "Portrait of " + mentor.name;
  document.getElementById("mentorName").textContent = mentor.name;
  document.getElementById("mentorNameInline").textContent = mentor.name;
  document.getElementById("mentorTitle").textContent = mentor.title;
  document.getElementById("mentorBio").textContent = mentor.bio;

  document.getElementById("mentorTags").innerHTML = mentor.expertise.map(function (slug) {
    return '<span class="em-mentor-card__tag">' + getCategoryLabel(slug) + '</span>';
  }).join("");

  document.getElementById("mentorAchievements").innerHTML = mentor.achievements.map(function (item) {
    return '<li class="text-body-md">' + item + '</li>';
  }).join("");

  var courses = getCoursesByMentor(mentor.name);
  document.getElementById("mentorRating").textContent = mentor.rating.toFixed(1);
  document.getElementById("mentorStudents").textContent = formatCount(mentor.students) + " students";
  document.getElementById("mentorCourseCount").textContent = courses.length + " course" + (courses.length === 1 ? "" : "s");

  document.getElementById("mentorCoursesGrid").innerHTML = courses.map(renderCourseCardHTML).join("");
  initWishlistButtons();
}
