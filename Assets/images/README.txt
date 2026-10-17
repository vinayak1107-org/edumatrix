This folder is where local image assets belong (the EduMatrix logo,
course cover images, instructor photos, etc.).

Right now, every page still points to the original placeholder images
hosted on googleusercontent.com (from the initial Stitch design export).
Those links work fine for now, but they're not under your control long
term.

To switch to local images:
1. Save your image files into this folder (e.g. assets/images/edumatrix-logo.png)
2. Find/replace the old googleusercontent.com URLs in the HTML/JS files
   with the new local path, e.g.:
     assets/images/edumatrix-logo.png

The logo appears in the <nav> and <footer> of every page.
Course/category images are defined once in js/courses-data.js (the
EM_IMG object) and reused everywhere via the shared course data model —
updating the paths there will update every page that shows a course.
