/* ==========================================================================
   EduMatrix — blog.js
   Renders the blog grid from EDUMATRIX_BLOG_POSTS with a category filter.

   Depends on: blog-data.js (loaded first)
   ========================================================================== */

var blogPageState = {
  activeCategory: "all"
};

document.addEventListener("DOMContentLoaded", function () {
  renderBlogCategoryFilters();
  renderBlogGrid();
});

function renderBlogCategoryFilters() {
  var container = document.getElementById("blogCategoryFilters");
  var categories = ["all"].concat(EDUMATRIX_BLOG_CATEGORIES);

  container.innerHTML = categories.map(function (category) {
    var isActive = blogPageState.activeCategory === category;
    var label = category === "all" ? "All" : category;
    return (
      '<button type="button" class="' + (isActive ? "btn-em-primary" : "btn-em-secondary") + '" data-blog-category-chip="' + category + '" style="padding: 8px 18px; min-height: 40px;">' +
        label +
      '</button>'
    );
  }).join("");

  container.querySelectorAll("[data-blog-category-chip]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      blogPageState.activeCategory = btn.getAttribute("data-blog-category-chip");
      renderBlogCategoryFilters();
      renderBlogGrid();
    });
  });
}

function renderBlogGrid() {
  var posts = EDUMATRIX_BLOG_POSTS.filter(function (post) {
    return blogPageState.activeCategory === "all" || post.category === blogPageState.activeCategory;
  });

  document.getElementById("blogGrid").innerHTML = posts.map(renderBlogCardHTML).join("");
}

function renderBlogCardHTML(post) {
  return (
    '<div class="col-12 col-sm-6 col-lg-4">' +
      '<a href="blog-details.html?id=' + post.id + '" class="em-blog-card shadow-em-1">' +
        '<div class="em-blog-card__media">' +
          '<img src="' + post.image + '" alt="' + post.title + '" loading="lazy" />' +
        '</div>' +
        '<div class="em-blog-card__body">' +
          '<span class="em-course-card__badge d-inline-flex mb-3" style="position: static; width: fit-content;">' + post.category + '</span>' +
          '<h2 class="text-headline-md mb-2" style="font-size: 20px;">' + post.title + '</h2>' +
          '<p class="text-body-md text-muted-em mb-3" style="flex-grow: 1;">' + post.excerpt + '</p>' +
          '<div class="d-flex align-items-center gap-2 pt-3 mt-auto" style="border-top: 1px solid var(--em-outline-variant);">' +
            '<img src="' + post.authorImage + '" alt="" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; filter: grayscale(1);" />' +
            '<div>' +
              '<p class="text-label-md m-0">' + post.author + '</p>' +
              '<p class="text-caption text-muted-em m-0">' + formatBlogDate(post.date) + ' · ' + post.readTime + '</p>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</a>' +
    '</div>'
  );
}

function formatBlogDate(isoString) {
  var date = new Date(isoString);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
