/* ==========================================================================
   EduMatrix — profile.js
   Pre-fills and saves the profile form, and handles the password-change
   form. Both operate on the demo account store from auth.js.

   Depends on: storage.js, auth.js (both loaded first)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {
  var user = getCurrentUser();

  if (!user) {
    document.getElementById("profileGuestState").classList.remove("d-none");
    document.getElementById("profileContent").classList.add("d-none");
    return;
  }

  document.getElementById("profileContent").classList.remove("d-none");
  prefillProfile(user);
  bindProfileForm();
  bindPasswordForm();
});

function prefillProfile(user) {
  document.getElementById("profileName").value = user.name || "";
  document.getElementById("profileEmail").value = user.email || "";
  updateAvatarAndDisplayName(user);
}

function updateAvatarAndDisplayName(user) {
  var initials = (user.name || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(function (part) { return part.charAt(0).toUpperCase(); })
    .join("");

  document.getElementById("profileAvatarInitials").textContent = initials || "?";
  document.getElementById("profileDisplayName").textContent = user.name || "—";
}

function bindProfileForm() {
  var form = document.getElementById("profileForm");
  var alertBox = document.getElementById("profileAlert");

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }

    var updates = {
      name: document.getElementById("profileName").value.trim(),
      email: document.getElementById("profileEmail").value.trim()
    };

    updateUserProfile(updates);
    updateAvatarAndDisplayName(updates);
    updateAuthNavUI(); // refresh the navbar's name display too

    alertBox.classList.remove("d-none");
    window.setTimeout(function () { alertBox.classList.add("d-none"); }, 3000);
  });
}

function bindPasswordForm() {
  var form = document.getElementById("passwordForm");
  var errorAlert = document.getElementById("passwordAlert");
  var successAlert = document.getElementById("passwordSuccessAlert");

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    errorAlert.classList.add("d-none");
    successAlert.classList.add("d-none");

    var newPassword = document.getElementById("newPassword").value;
    var confirmPassword = document.getElementById("confirmNewPassword").value;

    if (newPassword !== confirmPassword) {
      errorAlert.textContent = "New passwords don't match.";
      errorAlert.classList.remove("d-none");
      return;
    }

    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }

    var result = changeUserPassword({
      currentPassword: document.getElementById("currentPassword").value,
      newPassword: newPassword
    });

    if (!result.success) {
      errorAlert.textContent = result.error;
      errorAlert.classList.remove("d-none");
      return;
    }

    form.reset();
    form.classList.remove("was-validated");
    successAlert.classList.remove("d-none");
  });
}
