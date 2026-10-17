/* ==========================================================================
   EduMatrix — create-course.js
   Drives the 5-step course creation form: Course Information → Curriculum
   → Pricing → Media → Publish. On submit, saves a new course record to
   localStorage (see instructor-data.js) and redirects to
   instructor-courses.html.

   Depends on: courses-data.js, instructor-data.js (both loaded first)
   ========================================================================== */

var createCourseState = {
  currentStep: 1,
  totalSteps: 5,
  moduleCount: 0
};

document.addEventListener("DOMContentLoaded", function () {
  populateCategoryOptions();
  addModuleRow(); // start with one module row so the step isn't empty
  addModuleRow();

  document.getElementById("addModuleBtn").addEventListener("click", addModuleRow);
  document.getElementById("nextStepBtn").addEventListener("click", goToNextStep);
  document.getElementById("prevStepBtn").addEventListener("click", goToPreviousStep);
  document.getElementById("courseImageUrl").addEventListener("input", updateImagePreview);
  document.getElementById("saveDraftBtn").addEventListener("click", function () { submitCourse("draft"); });

  document.getElementById("createCourseForm").addEventListener("submit", function (event) {
    event.preventDefault();
    submitCourse("published");
  });
});

function populateCategoryOptions() {
  var select = document.getElementById("courseCategory");
  select.innerHTML = '<option value="" selected disabled>Choose category</option>' +
    EDUMATRIX_CATEGORIES.map(function (cat) {
      return '<option value="' + cat.slug + '">' + cat.label + '</option>';
    }).join("");
}

/* --------------------------------------------------------------------------
   CURRICULUM MODULES
   -------------------------------------------------------------------------- */

function addModuleRow() {
  createCourseState.moduleCount++;
  var list = document.getElementById("moduleList");
  var row = document.createElement("div");
  row.className = "em-module-row";
  row.innerHTML =
    '<input type="text" class="form-control" placeholder="Module ' + createCourseState.moduleCount + ' title" data-module-input style="min-height: 44px; border-radius: var(--em-radius); border-color: var(--em-border);" />' +
    '<button type="button" class="btn-em-ghost border" style="border-color: var(--em-outline); min-height: 44px; padding-inline: 14px;" data-remove-module aria-label="Remove module">' +
      '<span class="material-symbols-outlined" aria-hidden="true">close</span>' +
    '</button>';

  row.querySelector("[data-remove-module]").addEventListener("click", function () {
    row.remove();
  });

  list.appendChild(row);
}

function getModuleTitles() {
  return Array.prototype.slice
    .call(document.querySelectorAll("[data-module-input]"))
    .map(function (input) { return input.value.trim(); })
    .filter(Boolean);
}

/* --------------------------------------------------------------------------
   STEP NAVIGATION
   -------------------------------------------------------------------------- */

function goToNextStep() {
  if (!validateCurrentStep()) return;
  if (createCourseState.currentStep >= createCourseState.totalSteps) return;
  setStep(createCourseState.currentStep + 1);
}

function goToPreviousStep() {
  if (createCourseState.currentStep <= 1) return;
  setStep(createCourseState.currentStep - 1);
}

function setStep(stepNumber) {
  createCourseState.currentStep = stepNumber;

  document.querySelectorAll(".em-form-step").forEach(function (stepEl) {
    stepEl.classList.toggle("is-active", Number(stepEl.getAttribute("data-step")) === stepNumber);
  });

  document.querySelectorAll("[data-step-dot]").forEach(function (dot) {
    var dotStep = Number(dot.getAttribute("data-step-dot"));
    dot.classList.toggle("is-active", dotStep === stepNumber);
    dot.classList.toggle("is-complete", dotStep < stepNumber);
  });

  document.getElementById("prevStepBtn").classList.toggle("invisible", stepNumber === 1);
  document.getElementById("nextStepBtn").classList.toggle("d-none", stepNumber === createCourseState.totalSteps);
  document.getElementById("publishBtn").classList.toggle("d-none", stepNumber !== createCourseState.totalSteps);
  document.getElementById("saveDraftBtn").classList.toggle("d-none", stepNumber !== createCourseState.totalSteps);

  if (stepNumber === createCourseState.totalSteps) {
    renderReviewSummary();
  }
}

function validateCurrentStep() {
  var stepEl = document.querySelector('.em-form-step[data-step="' + createCourseState.currentStep + '"]');
  var fields = stepEl.querySelectorAll("input[required], select[required], textarea[required]");
  var isValid = true;

  fields.forEach(function (field) {
    var fieldValid = field.checkValidity();
    field.classList.toggle("is-invalid", !fieldValid);
    if (!fieldValid) isValid = false;
  });

  return isValid;
}

/* --------------------------------------------------------------------------
   REVIEW + SUBMIT
   -------------------------------------------------------------------------- */

function renderReviewSummary() {
  var title = document.getElementById("courseTitle").value || "Untitled course";
  var category = document.getElementById("courseCategory").value;
  var level = document.getElementById("courseLevel").value;
  var price = document.getElementById("coursePrice").value || "0";
  var moduleTitles = getModuleTitles();

  document.getElementById("reviewSummary").innerHTML =
    reviewRow("Title", title) +
    reviewRow("Category", category ? getCategoryLabel(category) : "—") +
    reviewRow("Level", level || "—") +
    reviewRow("Price", "$" + price) +
    reviewRow("Modules", moduleTitles.length ? moduleTitles.join(", ") : "None added");
}

function reviewRow(label, value) {
  return (
    '<div class="d-flex justify-content-between gap-3">' +
      '<span class="text-label-md text-muted-em">' + label + '</span>' +
      '<span class="text-body-md text-end">' + value + '</span>' +
    '</div>'
  );
}

function submitCourse(status) {
  // Draft saves skip full validation (a draft can be incomplete by
  // definition); publishing still requires step 1 to be valid.
  if (status === "published") {
    var originalStep = createCourseState.currentStep;
    createCourseState.currentStep = 1;
    var step1Valid = validateCurrentStep();
    createCourseState.currentStep = originalStep;
    if (!step1Valid) {
      setStep(1);
      return;
    }
  }

  var course = {
    id: generateInstructorCourseId(),
    title: document.getElementById("courseTitle").value.trim() || "Untitled course",
    category: document.getElementById("courseCategory").value || "programming",
    price: Number(document.getElementById("coursePrice").value) || 0,
    status: status,
    students: 0,
    rating: 0,
    revenue: 0,
    createdDate: new Date().toISOString(),
    image: document.getElementById("courseImageUrl").value.trim() || EM_IMG.courses.python
  };

  saveInstructorCourse(course);
  window.location.href = "instructor-courses.html";
}

function updateImagePreview() {
  var url = document.getElementById("courseImageUrl").value.trim();
  var preview = document.getElementById("courseImagePreview");

  if (url) {
    preview.src = url;
    preview.classList.remove("d-none");
  } else {
    preview.classList.add("d-none");
  }
}
