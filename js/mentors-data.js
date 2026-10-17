/* ==========================================================================
   EduMatrix — mentors-data.js
   Shared mentor/instructor data. Reuses the three instructor identities
   already established in courses-data.js (Dr. A. Mercer, S. Chen,
   J. Hayes) so mentor profiles, course listings, and the About page
   team section all agree with each other.

   Load AFTER courses-data.js (uses EM_IMG and EDUMATRIX_COURSES).
   ========================================================================== */

var EDUMATRIX_MENTORS = [
  {
    id: 1,
    name: "Dr. A. Mercer",
    title: "Principal Software Architect",
    expertise: ["programming", "security", "data-science"],
    image: EM_IMG.instructors.mercer,
    rating: 4.9,
    students: 24500,
    bio: "Dr. Mercer spent over a decade building large-scale distributed systems before moving into education full-time. Their courses focus on the architectural thinking that separates a working prototype from a system that survives production.",
    achievements: [
      "PhD in Computer Science",
      "Former Principal Engineer at a Fortune 500 tech company",
      "Published author on distributed systems design"
    ]
  },
  {
    id: 2,
    name: "S. Chen",
    title: "Design Director",
    expertise: ["uiux", "web-dev", "marketing"],
    image: EM_IMG.instructors.chen,
    rating: 4.8,
    students: 19800,
    bio: "S. Chen has led design teams at three different product companies, shipping design systems used by millions of people. Their teaching style favors first-principles thinking over trend-chasing.",
    achievements: [
      "10+ years leading product design teams",
      "Built design systems adopted company-wide at multiple startups",
      "Frequent speaker at design conferences"
    ]
  },
  {
    id: 3,
    name: "J. Hayes",
    title: "Head of Applied AI",
    expertise: ["ai", "business"],
    image: EM_IMG.instructors.hayes,
    rating: 5.0,
    students: 31200,
    bio: "J. Hayes works at the intersection of machine learning research and real product decisions. Their courses are built for people who need to ship AI features, not just understand the math behind them.",
    achievements: [
      "Led applied ML teams at two high-growth startups",
      "Advises early-stage founders on AI product strategy",
      "Regularly cited for practical, no-hype teaching style"
    ]
  }
];

/**
 * Look up a mentor by id.
 * @param {number|string} id
 * @returns {Object|undefined}
 */
function getMentorById(id) {
  var numericId = Number(id);
  return EDUMATRIX_MENTORS.find(function (mentor) {
    return mentor.id === numericId;
  });
}

/**
 * Every course taught by a given mentor, matched by instructor name
 * (the demo data model doesn't have a formal instructor id yet).
 * @param {string} mentorName
 */
function getCoursesByMentor(mentorName) {
  return EDUMATRIX_COURSES.filter(function (course) {
    return course.instructor === mentorName;
  });
}
