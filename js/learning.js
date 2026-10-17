/* ==========================================================================
   EduMatrix — learning.js
   A simulated course player: no real video plays, but lesson navigation,
   completion tracking, and progress percentage all work for real against
   edumatrix_progress, so my-courses.html and dashboard.html reflect it.

   Depends on: courses-data.js, storage.js (both loaded first)
   ========================================================================== */

var learningState = {
  course: null,
  lessons: [],
  currentIndex: 0
};

document.addEventListener("DOMContentLoaded", function () {
  var courseId = new URLSearchParams(window.location.search).get("id");
  var course = getCourseById(courseId);

  if (!course) {
    document.getElementById("notFoundState").classList.remove("d-none");
    document.getElementById("learningContent").classList.add("d-none");
    return;
  }

  learningState.course = course;
  learningState.lessons = buildLessonPlan(course);

  var entry = ensureProgressEntry(course.id);
  learningState.currentIndex = Math.min(entry.completedLessons.length, learningState.lessons.length - 1);

  document.title = course.title + " | EduMatrix Learning";
  document.getElementById("learningContent").classList.remove("d-none");
  document.getElementById("courseTitleLabel").textContent = course.title;

  bindControls();
  renderLesson();
  renderSidebar();
});

/**
 * Builds a deterministic, demo-scale curriculum for any course: 5
 * modules of 2 lessons each. Mirrors the structure used on
 * course-details.html's curriculum accordion, but flattened into a
 * single indexed list since the player navigates lesson-by-lesson.
 */
function buildLessonPlan(course) {
  var moduleTitles = [
    "Introduction",
    "Core Concepts",
    "Practical Implementation",
    "Advanced Techniques",
    "Final Project"
  ];
  var lessonTitles = [
    ["Welcome & Course Overview", "Setting Up Your Environment"],
    ["Foundational Principles", "Guided Walkthrough"],
    ["Building the First Project", "Common Pitfalls & Fixes"],
    ["Going Beyond the Basics", "Case Study Breakdown"],
    ["Final Project Brief", "Submission & Certificate"]
  ];
  var durations = ["6 min", "12 min", "18 min", "22 min", "35 min", "15 min", "28 min", "20 min", "10 min", "8 min"];

  var lessons = [];
  var counter = 0;
  moduleTitles.forEach(function (moduleTitle, moduleIndex) {
    lessonTitles[moduleIndex].forEach(function (lessonTitle) {
      lessons.push({
        index: counter,
        moduleTitle: moduleTitle,
        title: lessonTitle,
        duration: durations[counter] || "10 min",
        description: "Part of \"" + moduleTitle + "\" in " + course.title + ". " +
          "This lesson builds directly on what came before it — revisit the previous lesson if anything here feels unfamiliar."
      });
      counter++;
    });
  });
  return lessons;
}

/**
 * Finds the progress entry for this course, creating one on the fly if
 * the learner reached this page without going through checkout (keeps
 * the player usable for demo/preview purposes). Also backfills the
 * `completedLessons` array, which older progress entries (written by
 * payment-success.js) don't have yet.
 */
function ensureProgressEntry(courseId) {
  var progress = emGetJSON(EDUMATRIX_KEYS.progress, []);
  var entry = progress.find(function (p) { return p.courseId === courseId; });

  if (!entry) {
    entry = {
      courseId: courseId,
      status: "not-started",
      progressPercent: 0,
      enrolledDate: new Date().toISOString(),
      lastLessonIndex: 0,
      completedLessons: []
    };
    progress.push(entry);
    emSetJSON(EDUMATRIX_KEYS.progress, progress);
  } else if (!entry.completedLessons) {
    entry.completedLessons = [];
    emSetJSON(EDUMATRIX_KEYS.progress, progress);
  }

  return entry;
}

function getProgressEntry() {
  var progress = emGetJSON(EDUMATRIX_KEYS.progress, []);
  return progress.find(function (p) { return p.courseId === learningState.course.id; });
}

function saveProgressEntry(updatedEntry) {
  var progress = emGetJSON(EDUMATRIX_KEYS.progress, []);
  var index = progress.findIndex(function (p) { return p.courseId === learningState.course.id; });
  if (index !== -1) {
    progress[index] = updatedEntry;
    emSetJSON(EDUMATRIX_KEYS.progress, progress);
  }
}

/* --------------------------------------------------------------------------
   RENDERING
   -------------------------------------------------------------------------- */

function renderLesson() {
  var lesson = learningState.lessons[learningState.currentIndex];
  var course = learningState.course;
  var entry = getProgressEntry();
  var isComplete = entry.completedLessons.indexOf(lesson.index) !== -1;

  document.getElementById("lessonBackgroundImage").src = course.image;
  document.getElementById("lessonBackgroundImage").alt = course.title;
  document.getElementById("lessonTitle").textContent = lesson.title;
  document.getElementById("lessonDescription").textContent = lesson.description;

  document.getElementById("prevLessonBtn").disabled = learningState.currentIndex === 0;
  document.getElementById("nextLessonBtn").disabled = learningState.currentIndex === learningState.lessons.length - 1;

  var markCompleteBtn = document.getElementById("markCompleteBtn");
  markCompleteBtn.textContent = isComplete ? "Lesson Complete ✓" : "Mark Lesson Complete";
  markCompleteBtn.disabled = isComplete;
}

function renderSidebar() {
  var entry = getProgressEntry();

  document.getElementById("sidebarProgressText").textContent = entry.progressPercent + "%";
  document.getElementById("sidebarProgressFill").style.width = entry.progressPercent + "%";

  document.getElementById("lessonList").innerHTML = learningState.lessons.map(function (lesson) {
    var isActive = lesson.index === learningState.currentIndex;
    var isComplete = entry.completedLessons.indexOf(lesson.index) !== -1;
    return (
      '<div class="em-lesson-item' + (isActive ? " is-active" : "") + (isComplete ? " is-complete" : "") + '" data-lesson-index="' + lesson.index + '" role="button" tabindex="0">' +
        '<span class="material-symbols-outlined em-lesson-item__check" style="font-size: 18px;" aria-hidden="true">' + (isComplete ? "check_circle" : "radio_button_unchecked") + '</span>' +
        '<span class="flex-grow-1">' + lesson.title + '</span>' +
        '<span class="text-caption" style="opacity: 0.8;">' + lesson.duration + '</span>' +
      '</div>'
    );
  }).join("");

  document.querySelectorAll("[data-lesson-index]").forEach(function (item) {
    item.addEventListener("click", function () {
      learningState.currentIndex = Number(item.getAttribute("data-lesson-index"));
      renderLesson();
      renderSidebar();
    });
  });
}

/* --------------------------------------------------------------------------
   CONTROLS
   -------------------------------------------------------------------------- */

function bindControls() {
  document.getElementById("prevLessonBtn").addEventListener("click", function () {
    if (learningState.currentIndex > 0) {
      learningState.currentIndex--;
      renderLesson();
      renderSidebar();
    }
  });

  document.getElementById("nextLessonBtn").addEventListener("click", function () {
    if (learningState.currentIndex < learningState.lessons.length - 1) {
      learningState.currentIndex++;
      renderLesson();
      renderSidebar();
    }
  });

  document.getElementById("markCompleteBtn").addEventListener("click", markCurrentLessonComplete);
}

function markCurrentLessonComplete() {
  var entry = getProgressEntry();
  var lesson = learningState.lessons[learningState.currentIndex];

  if (entry.completedLessons.indexOf(lesson.index) === -1) {
    entry.completedLessons.push(lesson.index);
  }

  entry.lastLessonIndex = learningState.currentIndex;
  entry.progressPercent = Math.round((entry.completedLessons.length / learningState.lessons.length) * 100);
  entry.status = entry.progressPercent >= 100 ? "completed" : "in-progress";

  saveProgressEntry(entry);
  renderLesson();
  renderSidebar();

  if (entry.status === "completed") {
    window.alert("Course complete! Your certificate is ready on the Certificates page.");
  } else if (learningState.currentIndex < learningState.lessons.length - 1) {
    learningState.currentIndex++;
    renderLesson();
    renderSidebar();
  }
}
