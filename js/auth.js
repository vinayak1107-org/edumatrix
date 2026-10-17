/* ==========================================================================
   EduMatrix — auth.js
   FRONTEND DEMO AUTHENTICATION ONLY.

   This simulates signup/login/logout using localStorage so the rest of
   the site (dashboard, my-courses, checkout pre-fill, etc.) has a real
   "logged in" state to react to. It is NOT secure and must never be
   treated as production authentication:
     - Passwords are only lightly obfuscated (base64), not hashed.
     - Anyone with browser devtools can read or forge the session.
     - There is no server, so nothing here is verified by anything but
       this same browser's localStorage.
   A real implementation would replace every function below with calls
   to a real backend/auth provider, without changing how the rest of
   the site calls into this file (getCurrentUser, isLoggedIn, etc.).

   Depends on: storage.js (must be loaded first)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {
  updateAuthNavUI();
});

/* --------------------------------------------------------------------------
   ACCOUNTS (registered users)
   -------------------------------------------------------------------------- */

function getAccounts() {
  return emGetJSON(EDUMATRIX_KEYS.accounts, []);
}

function findAccountByEmail(email) {
  var normalized = email.trim().toLowerCase();
  return getAccounts().find(function (acct) {
    return acct.email.toLowerCase() === normalized;
  });
}

/**
 * Registers a new demo account.
 * @param {{name: string, email: string, password: string}} details
 * @returns {{success: boolean, error?: string}}
 */
function signupUser(details) {
  var email = details.email.trim().toLowerCase();

  if (findAccountByEmail(email)) {
    return { success: false, error: "An account with this email already exists." };
  }

  var accounts = getAccounts();
  accounts.push({
    name: details.name.trim(),
    email: email,
    // NOT secure — see file header. A real backend would hash + salt this server-side.
    passwordObfuscated: btoa(details.password)
  });
  emSetJSON(EDUMATRIX_KEYS.accounts, accounts);

  setCurrentUser({ name: details.name.trim(), email: email });
  return { success: true };
}

/**
 * @param {{email: string, password: string}} credentials
 * @returns {{success: boolean, error?: string}}
 */
function loginUser(credentials) {
  var account = findAccountByEmail(credentials.email);

  if (!account || account.passwordObfuscated !== btoa(credentials.password)) {
    return { success: false, error: "Incorrect email or password." };
  }

  setCurrentUser({ name: account.name, email: account.email });
  return { success: true };
}

function logoutUser() {
  localStorage.removeItem(EDUMATRIX_KEYS.user);
  window.location.href = "index.html";
}

/**
 * Updates the current session AND the matching account record (so the
 * change persists across logins, not just this session).
 * @param {{name: string, email: string}} updates
 */
function updateUserProfile(updates) {
  var currentUser = getCurrentUser();
  if (!currentUser) return { success: false, error: "Not logged in." };

  var accounts = getAccounts();
  var account = accounts.find(function (acct) {
    return acct.email.toLowerCase() === currentUser.email.toLowerCase();
  });

  if (account) {
    account.name = updates.name;
    account.email = updates.email.toLowerCase();
    emSetJSON(EDUMATRIX_KEYS.accounts, accounts);
  }

  setCurrentUser({ name: updates.name, email: updates.email.toLowerCase() });
  return { success: true };
}

/**
 * @param {{currentPassword: string, newPassword: string}} details
 * @returns {{success: boolean, error?: string}}
 */
function changeUserPassword(details) {
  var currentUser = getCurrentUser();
  if (!currentUser) return { success: false, error: "Not logged in." };

  var accounts = getAccounts();
  var account = accounts.find(function (acct) {
    return acct.email.toLowerCase() === currentUser.email.toLowerCase();
  });

  if (!account || account.passwordObfuscated !== btoa(details.currentPassword)) {
    return { success: false, error: "Current password is incorrect." };
  }

  account.passwordObfuscated = btoa(details.newPassword);
  emSetJSON(EDUMATRIX_KEYS.accounts, accounts);
  return { success: true };
}

/* --------------------------------------------------------------------------
   SESSION
   -------------------------------------------------------------------------- */

function setCurrentUser(user) {
  emSetJSON(EDUMATRIX_KEYS.user, user);
}

function getCurrentUser() {
  return emGetJSON(EDUMATRIX_KEYS.user, null);
}

function isLoggedIn() {
  return getCurrentUser() !== null;
}

/**
 * Call at the top of any page that requires a logged-in user. If no
 * session exists, redirects to login.html with a `next` param so the
 * person lands back where they started after signing in.
 * @returns {boolean} true if there IS a logged-in user (safe to continue rendering)
 */
function requireAuth() {
  if (isLoggedIn()) return true;
  var currentPage = window.location.pathname.split("/").pop();
  window.location.href = "login.html?next=" + encodeURIComponent(currentPage);
  return false;
}

/* --------------------------------------------------------------------------
   NAVBAR STATE
   Swaps the "Log In / Sign Up" buttons for the user's name + a Log Out
   link whenever a session exists. Works on any page that includes a
   container with id="navAuthArea" around those buttons.
   -------------------------------------------------------------------------- */

function updateAuthNavUI() {
  var containers = document.querySelectorAll("[data-nav-auth-area]");
  if (!containers.length) return;

  var user = getCurrentUser();

  containers.forEach(function (container) {
    if (user) {
      container.innerHTML =
        '<a href="dashboard.html" class="text-label-md d-flex align-items-center gap-2" style="color: var(--em-on-surface);">' +
          '<span class="material-symbols-outlined" style="font-size: 20px;" aria-hidden="true">account_circle</span>' +
          escapeHTML(firstName(user.name)) +
        '</a>' +
        '<button type="button" class="btn-em-secondary" data-logout-btn>Log Out</button>';

      var logoutBtn = container.querySelector("[data-logout-btn]");
      if (logoutBtn) {
        logoutBtn.addEventListener("click", logoutUser);
      }
    } else {
      container.innerHTML =
        '<a class="btn-em-secondary" href="login.html">Log In</a>' +
        '<a class="btn-em-primary" href="signup.html">Sign Up</a>';
    }
  });
}

function firstName(fullName) {
  return (fullName || "").trim().split(" ")[0] || "there";
}

function escapeHTML(str) {
  var div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
