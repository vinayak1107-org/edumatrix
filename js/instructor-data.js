/* ==========================================================================
   EduMatrix — instructor-data.js
   Data for the instructor area (instructor-dashboard.html,
   instructor-courses.html, create-course.html, instructor-analytics.html,
   instructor-earnings.html).

   For this frontend demo, the logged-in user (see auth.js) is treated as
   the instructor. A handful of seed courses simulate an existing catalog;
   anything created through create-course.html is layered on top and
   persisted to localStorage so it survives a page reload.

   Load AFTER courses-data.js (reuses EM_IMG) and storage.js.
   ========================================================================== */

var EM_INSTRUCTOR_SEED_COURSES = [
  {
    id: "instr-1",
    title: "Advanced Python Architectures",
    category: "programming",
    price: 199,
    status: "published",
    students: 8400,
    rating: 4.9,
    revenue: 47200,
    createdDate: "2025-11-02",
    image: EM_IMG.courses.python
  },
  {
    id: "instr-2",
    title: "Applied Cyber Security Fundamentals",
    category: "security",
    price: 199,
    status: "published",
    students: 4600,
    rating: 4.7,
    revenue: 21800,
    createdDate: "2026-01-14",
    image: EM_IMG.courses.python
  },
  {
    id: "instr-3",
    title: "Backend Systems Design (Draft)",
    category: "web-dev",
    price: 179,
    status: "draft",
    students: 0,
    rating: 0,
    revenue: 0,
    createdDate: "2026-06-10",
    image: EM_IMG.courses.python
  }
];

var EM_INSTRUCTOR_MONTHLY_REVENUE = [
  { month: "Mar", amount: 9200 },
  { month: "Apr", amount: 10800 },
  { month: "May", amount: 12100 },
  { month: "Jun", amount: 11400 },
  { month: "Jul", amount: 13900 },
  { month: "Aug", amount: 15600 }
];

function getInstructorCourses() {
  var createdCourses = emGetJSON(EDUMATRIX_KEYS.instructorCourses, []);
  return EM_INSTRUCTOR_SEED_COURSES.concat(createdCourses);
}

function saveInstructorCourse(course) {
  var createdCourses = emGetJSON(EDUMATRIX_KEYS.instructorCourses, []);
  createdCourses.push(course);
  emSetJSON(EDUMATRIX_KEYS.instructorCourses, createdCourses);
}

function deleteInstructorCourse(courseId) {
  // Seed courses aren't deletable in this demo (there's no backend to
  // persist that against) — only courses created via create-course.html.
  var createdCourses = emGetJSON(EDUMATRIX_KEYS.instructorCourses, []);
  var updated = createdCourses.filter(function (c) { return c.id !== courseId; });
  emSetJSON(EDUMATRIX_KEYS.instructorCourses, updated);
}

function getInstructorStats() {
  var courses = getInstructorCourses();
  var published = courses.filter(function (c) { return c.status === "published"; });

  var totalRevenue = courses.reduce(function (sum, c) { return sum + c.revenue; }, 0);
  var totalStudents = courses.reduce(function (sum, c) { return sum + c.students; }, 0);
  var avgRating = published.length
    ? published.reduce(function (sum, c) { return sum + c.rating; }, 0) / published.length
    : 0;

  return {
    totalCourses: courses.length,
    publishedCourses: published.length,
    totalRevenue: totalRevenue,
    totalStudents: totalStudents,
    avgRating: avgRating
  };
}

function generateInstructorCourseId() {
  return "instr-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}
