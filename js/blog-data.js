/* ==========================================================================
   EduMatrix — blog-data.js
   Shared blog post data for blog.html and blog-details.html.
   Load AFTER courses-data.js (reuses EM_IMG for cover art).
   ========================================================================== */

var EDUMATRIX_BLOG_CATEGORIES = ["AI", "Coding", "Design", "Career", "Productivity"];

var EDUMATRIX_BLOG_POSTS = [
  {
    id: 1,
    title: "Why 'Learn to Code' Is the Wrong Advice in 2026",
    category: "Career",
    author: "J. Hayes",
    authorImage: EM_IMG.instructors.hayes,
    date: "2026-06-02",
    readTime: "6 min read",
    image: EM_IMG.courses.ai,
    excerpt: "Coding is table stakes now. The professionals pulling ahead are the ones who pair technical fluency with judgment about what's worth building.",
    content: [
      "For most of the last decade, \"learn to code\" was reasonable career advice on its own. Demand for engineers outpaced supply, and a bootcamp certificate could meaningfully change someone's trajectory.",
      "That calculus has shifted. Writing code is no longer the scarce skill — knowing what to build, why it matters, and how to evaluate whether it worked is. AI tools have made the mechanical act of producing code dramatically cheaper, which means the value has moved upstream, toward judgment.",
      "This doesn't mean technical skills stopped mattering. It means they stopped being sufficient on their own. The engineers and designers who are thriving right now are the ones who combine technical fluency with product sense, communication, and a working understanding of the business they're operating in.",
      "If you're early in your career, the practical takeaway is this: don't just learn syntax. Learn to scope a problem, argue for a solution, and measure whether it actually worked. Those skills compound in a way that memorizing another framework doesn't."
    ]
  },
  {
    id: 2,
    title: "A Practical Framework for Evaluating AI Features",
    category: "AI",
    author: "J. Hayes",
    authorImage: EM_IMG.instructors.hayes,
    date: "2026-05-18",
    readTime: "8 min read",
    image: EM_IMG.courses.ai,
    excerpt: "Most teams shipping AI features skip straight to 'does it work' without defining what working actually means. Here's a simple framework to fix that.",
    content: [
      "Before you write a single prompt or fine-tune a single model, define three things: what success looks like, what failure looks like, and what an acceptable failure rate is. Most teams skip this step and end up debating vibes instead of numbers.",
      "Success and failure need to be observable, not just intuited. If you can't write down a rule for distinguishing a good output from a bad one, you don't have a definition yet — you have a feeling.",
      "Once you have that definition, build a small, boring evaluation set before you build anything clever. Twenty to fifty realistic examples, labeled by a human, will tell you more about whether your feature works than a week of manual testing.",
      "Finally, treat your acceptable failure rate as a product decision, not an engineering one. A support macro that's wrong 2% of the time is very different from a medical triage tool that's wrong 2% of the time — the tolerance has to match the stakes."
    ]
  },
  {
    id: 3,
    title: "Design Systems Are a People Problem, Not a Component Library",
    category: "Design",
    author: "S. Chen",
    authorImage: EM_IMG.instructors.chen,
    date: "2026-05-04",
    readTime: "7 min read",
    image: EM_IMG.courses.uiux,
    excerpt: "Most design systems fail from neglect, not bad components. The hard part was never the Figma file — it was getting people to actually use it.",
    content: [
      "Every design system starts the same way: a small team builds a beautiful, well-documented component library, ships it with excitement, and watches adoption stall six weeks later.",
      "The components were rarely the problem. The problem is almost always governance — who decides what gets added, who owns updates, and what happens when a product team needs something the system doesn't support yet.",
      "Treat your design system like a product with real users, not an art project. That means a roadmap, a feedback channel, and a visible owner who's accountable for its health — not just its existence.",
      "The teams that get this right build in public: they show work-in-progress, explain trade-offs, and make it easy for any designer or engineer to propose a change. Systems that stay quiet stay ignored."
    ]
  },
  {
    id: 4,
    title: "The Case for Boring Technology",
    category: "Coding",
    author: "Dr. A. Mercer",
    authorImage: EM_IMG.instructors.mercer,
    date: "2026-04-21",
    readTime: "5 min read",
    image: EM_IMG.courses.python,
    excerpt: "Choosing the newest framework rarely pays off the way it feels like it should. Here's why mature, well-understood tools usually win in production.",
    content: [
      "Every stack has a fixed budget of innovation tokens. Spend them on the parts of your product that are actually novel — not on your database, your deployment pipeline, or your authentication layer.",
      "Boring technology isn't a lack of ambition. It's a recognition that most of engineering is operating a system reliably over years, and unfamiliar tools make that operational burden heavier at exactly the moments you can least afford it.",
      "This doesn't mean never adopt anything new. It means being deliberate: know why you're introducing a new dependency, what problem it solves that your current stack genuinely can't, and who on the team will be responsible for understanding it deeply.",
      "The best engineering teams I've worked with are boring on purpose. Their systems are unglamorous and extremely reliable, which frees up their creative energy for the parts of the product that actually differentiate them."
    ]
  },
  {
    id: 5,
    title: "A Realistic Weekly Schedule for Learning While Working Full-Time",
    category: "Productivity",
    author: "S. Chen",
    authorImage: EM_IMG.instructors.chen,
    date: "2026-04-09",
    readTime: "4 min read",
    image: EM_IMG.courses.uiux,
    excerpt: "You don't need two free hours a day to build a new skill. You need a schedule that survives contact with a bad week.",
    content: [
      "Most learning plans fail because they assume a version of your week that doesn't exist — one with two uninterrupted hours every evening. Build a plan for your actual week instead.",
      "Start with your worst realistic week, not your best one. If you can find 45 minutes on your three busiest days, that's your baseline. Anything beyond that is a bonus, not the plan.",
      "Anchor study time to an existing habit rather than a specific clock time. \"After my morning coffee\" survives a schedule change much better than \"7:00 AM sharp.\"",
      "Finally, protect momentum over intensity. Twenty minutes of consistent practice most days will outperform a single exhausting weekend session almost every time."
    ]
  },
  {
    id: 6,
    title: "What Actually Changes When You Get Promoted to Senior",
    category: "Career",
    author: "Dr. A. Mercer",
    authorImage: EM_IMG.instructors.mercer,
    date: "2026-03-27",
    readTime: "6 min read",
    image: EM_IMG.courses.python,
    excerpt: "It's rarely about writing more code, faster. It's about the questions you're expected to answer before anyone else asks them.",
    content: [
      "The jump to senior is less about technical difficulty and more about scope of judgment. You're no longer just responsible for solving the problem in front of you — you're responsible for noticing which problems deserve attention in the first place.",
      "That shows up in small ways: flagging a risky dependency before it becomes an incident, pushing back on a deadline that doesn't account for real complexity, or noticing that two teams are quietly duplicating work.",
      "It also means your communication has to scale. Explaining a decision clearly to someone outside your immediate team becomes as important as making the decision correctly.",
      "If you're aiming for that jump, start practicing the judgment now, in whatever scope you currently have. Titles tend to catch up to behavior, not the other way around."
    ]
  }
];

function getBlogPostById(id) {
  var numericId = Number(id);
  return EDUMATRIX_BLOG_POSTS.find(function (post) {
    return post.id === numericId;
  });
}
