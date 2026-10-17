/* ==========================================================================
   EduMatrix — blog-details.js
   Reads ?id= from the URL and renders the matching post, plus a few
   related posts from the same category.

   Depends on: blog-data.js (loaded first)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {
  var postId = new URLSearchParams(window.location.search).get("id");
  var post = getBlogPostById(postId);

  if (!post) {
    document.getElementById("notFoundState").classList.remove("d-none");
    document.getElementById("articleContent").classList.add("d-none");
    return;
  }

  renderArticle(post);
});

function renderArticle(post) {
  document.getElementById("articleContent").classList.remove("d-none");
  document.title = post.title + " | EduMatrix Blog";

  var metaDescription = document.getElementById("pageDescription");
  if (metaDescription) metaDescription.setAttribute("content", post.excerpt);

  document.getElementById("breadcrumbTitle").textContent = post.title;
  document.getElementById("articleCategory").textContent = post.category;
  document.getElementById("articleTitle").textContent = post.title;
  document.getElementById("articleAuthorImage").src = post.authorImage;
  document.getElementById("articleAuthorImage").alt = "Portrait of " + post.author;
  document.getElementById("articleAuthor").textContent = post.author;
  document.getElementById("articleDate").textContent = formatBlogDate(post.date);
  document.getElementById("articleReadTime").textContent = post.readTime;
  document.getElementById("articleImage").src = post.image;
  document.getElementById("articleImage").alt = post.title;

  document.getElementById("articleBody").innerHTML = post.content.map(function (paragraph) {
    return "<p>" + paragraph + "</p>";
  }).join("");

  renderRelatedPosts(post);
}

function renderRelatedPosts(post) {
  var related = EDUMATRIX_BLOG_POSTS
    .filter(function (p) { return p.category === post.category && p.id !== post.id; })
    .slice(0, 2);

  if (related.length === 0) {
    related = EDUMATRIX_BLOG_POSTS.filter(function (p) { return p.id !== post.id; }).slice(0, 2);
  }

  document.getElementById("relatedPostsGrid").innerHTML = related.map(function (relatedPost) {
    return (
      '<div class="col-12 col-sm-6">' +
        '<a href="blog-details.html?id=' + relatedPost.id + '" class="d-block text-decoration-none shadow-em-1 rounded-4 overflow-hidden h-100" style="color: inherit; border-radius: var(--em-radius-lg);">' +
          '<img src="' + relatedPost.image + '" alt="' + relatedPost.title + '" style="width: 100%; height: 140px; object-fit: cover;" loading="lazy" />' +
          '<div class="p-3">' +
            '<p class="text-label-md m-0">' + relatedPost.title + '</p>' +
          '</div>' +
        '</a>' +
      '</div>'
    );
  }).join("");
}
