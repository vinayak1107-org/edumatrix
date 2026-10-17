/* ==========================================================================
   EduMatrix — auth-pages.js
   Page-specific wiring for login.html, signup.html, and
   forgot-password.html. Each bind* function checks whether its form
   exists before doing anything, so this one file can be safely
   included on all three pages without errors.

   Depends on: storage.js, auth.js (both loaded first)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {
  bindPasswordToggles();
  bindLoginForm();
  bindSignupForm();
  bindForgotPasswordForm();
});

/**
 * Wires up every "show/hide password" eye-icon button on the page.
 * Works for any input+button pair marked with [data-toggle-password].
 */
function bindPasswordToggles() {
  document.querySelectorAll("[data-toggle-password]").forEach(function (toggleBtn) {
    var field = document.getElementById(toggleBtn.getAttribute("data-toggle-password"));
    if (!field) return;

    toggleBtn.addEventListener("click", function () {
      var isHidden = field.type === "password";
      field.type = isHidden ? "text" : "password";
      toggleBtn.querySelector(".material-symbols-outlined").textContent = isHidden ? "visibility_off" : "visibility";
      toggleBtn.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
    });
  });
}

/* --------------------------------------------------------------------------
   LOGIN
   -------------------------------------------------------------------------- */

function bindLoginForm() {
  var form = document.getElementById("loginForm");
  if (!form) return;

  var alertBox = document.getElementById("loginAlert");

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }

    var result = loginUser({
      email: document.getElementById("loginEmail").value,
      password: document.getElementById("loginPassword").value
    });

    if (!result.success) {
      alertBox.textContent = result.error;
      alertBox.classList.remove("d-none");
      return;
    }

    alertBox.classList.add("d-none");
    var nextPage = new URLSearchParams(window.location.search).get("next");
    window.location.href = nextPage || "dashboard.html";
  });
}

/* --------------------------------------------------------------------------
   SIGNUP
   -------------------------------------------------------------------------- */

function bindSignupForm() {
  var form = document.getElementById("signupForm");
  if (!form) return;

  var alertBox = document.getElementById("signupAlert");
  var confirmField = document.getElementById("signupConfirmPassword");

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var passwordsMatch = document.getElementById("signupPassword").value === confirmField.value;
    confirmField.setCustomValidity(passwordsMatch ? "" : "Passwords must match.");

    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }

    var result = signupUser({
      name: document.getElementById("signupName").value,
      email: document.getElementById("signupEmail").value,
      password: document.getElementById("signupPassword").value
    });

    if (!result.success) {
      alertBox.textContent = result.error;
      alertBox.classList.remove("d-none");
      return;
    }

    alertBox.classList.add("d-none");
    window.location.href = "dashboard.html";
  });

  // Clear the custom "passwords must match" error as soon as the person
  // starts fixing it, rather than waiting for another submit attempt.
  confirmField.addEventListener("input", function () {
    confirmField.setCustomValidity("");
  });
}

/* --------------------------------------------------------------------------
   FORGOT PASSWORD
   -------------------------------------------------------------------------- */

function bindForgotPasswordForm() {
  var form = document.getElementById("forgotForm");
  if (!form) return;

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }

    var email = document.getElementById("forgotEmail").value;

    // Demo only: there's no email service here, so we simply simulate
    // the "check your inbox" confirmation regardless of whether the
    // account exists — this also avoids leaking which emails are
    // registered, which matches how real reset flows usually behave.
    document.getElementById("forgotSentEmail").textContent = email;
    document.getElementById("forgotRequestState").classList.add("d-none");
    document.getElementById("forgotSentState").classList.remove("d-none");
  });
}
