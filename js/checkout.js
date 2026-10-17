/* ==========================================================================
   EduMatrix — checkout.js
   Renders the order summary from the cart, switches the visible payment
   detail fields based on the selected method, validates the form, and
   simulates a payment flow: validate → processing state → success →
   save the order to localStorage → redirect to payment-success.html.

   This is a FRONTEND DEMO ONLY. No real payment is processed, no card
   details are transmitted anywhere, and nothing here should be treated
   as production payment infrastructure. See section 24 of the project
   brief for how a real gateway would be isolated behind this same UI.

   Depends on: courses-data.js, storage.js, main.js (all loaded first)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {
  var courses = loadCheckoutCourses();

  if (courses.length === 0) {
    document.getElementById("checkoutEmptyState").classList.remove("d-none");
    document.getElementById("checkoutContent").classList.add("d-none");
    return;
  }

  document.getElementById("checkoutContent").classList.remove("d-none");
  renderOrderSummary(courses);
  prefillCustomerInfo();
  bindPaymentMethodSwitch();
  bindFormSubmit(courses);
});

/**
 * If the person is logged in (see auth.js), pre-fill their name and
 * email so they don't have to retype it at checkout.
 */
function prefillCustomerInfo() {
  if (typeof getCurrentUser !== "function") return;
  var user = getCurrentUser();
  if (!user) return;
  document.getElementById("fullName").value = user.name || "";
  document.getElementById("email").value = user.email || "";
}

function loadCheckoutCourses() {
  return getCart()
    .map(function (item) { return getCourseById(item.courseId); })
    .filter(Boolean);
}

/* --------------------------------------------------------------------------
   ORDER SUMMARY
   -------------------------------------------------------------------------- */

function renderOrderSummary(courses) {
  var list = document.getElementById("checkoutItemsList");
  list.innerHTML = courses.map(function (course) {
    return (
      '<div class="d-flex align-items-center gap-3">' +
        '<img src="' + course.image + '" alt="' + course.title + '" style="width: 64px; height: 48px; border-radius: var(--em-radius); object-fit: cover;" />' +
        '<div class="flex-grow-1">' +
          '<p class="text-body-md m-0" style="font-weight: 600;">' + course.title + '</p>' +
          '<p class="text-caption text-muted-em m-0">' + course.instructor + '</p>' +
        '</div>' +
        '<span class="text-body-md" style="font-weight: 600;">$' + course.price + '</span>' +
      '</div>'
    );
  }).join("");

  var subtotal = courses.reduce(function (sum, c) { return sum + c.price; }, 0);
  document.getElementById("checkoutSubtotal").textContent = "$" + subtotal;
  document.getElementById("checkoutTotal").textContent = "$" + subtotal;
}

/* --------------------------------------------------------------------------
   PAYMENT METHOD SWITCHING
   -------------------------------------------------------------------------- */

function bindPaymentMethodSwitch() {
  var radios = document.querySelectorAll('input[name="paymentMethod"]');
  var panels = {
    card: document.getElementById("paymentFieldsCard"),
    upi: document.getElementById("paymentFieldsUpi"),
    netbanking: document.getElementById("paymentFieldsNetBanking"),
    wallet: document.getElementById("paymentFieldsWallet")
  };

  radios.forEach(function (radio) {
    radio.addEventListener("change", function () {
      Object.keys(panels).forEach(function (key) {
        panels[key].classList.toggle("d-none", key !== radio.value);
      });
    });
  });
}

function getSelectedPaymentMethod() {
  var checked = document.querySelector('input[name="paymentMethod"]:checked');
  return checked ? checked.value : "card";
}

/* --------------------------------------------------------------------------
   VALIDATION
   -------------------------------------------------------------------------- */

function validateCheckoutForm() {
  var form = document.getElementById("checkoutForm");
  var isValid = true;

  // Base HTML5 validation for the fields marked `required` (customer + billing).
  if (!form.checkValidity()) {
    isValid = false;
  }

  // Payment-method-specific validation, since only one panel is visible
  // at a time and its inputs aren't marked `required` in the markup.
  var method = getSelectedPaymentMethod();

  if (method === "card") {
    var cardNumber = document.getElementById("cardNumber").value.replace(/\s/g, "");
    var cardExpiry = document.getElementById("cardExpiry").value;
    var cardCvv = document.getElementById("cardCvv").value;
    var cardName = document.getElementById("cardName").value.trim();

    isValid = markFieldValid("cardNumber", /^\d{16}$/.test(cardNumber)) && isValid;
    isValid = markFieldValid("cardExpiry", /^(0[1-9]|1[0-2])\/\d{2}$/.test(cardExpiry)) && isValid;
    isValid = markFieldValid("cardCvv", /^\d{3,4}$/.test(cardCvv)) && isValid;
    isValid = markFieldValid("cardName", cardName.length > 0) && isValid;
  } else if (method === "upi") {
    var upiId = document.getElementById("upiId").value.trim();
    isValid = markFieldValid("upiId", /^[\w.\-]+@[\w.\-]+$/.test(upiId)) && isValid;
  } else if (method === "netbanking") {
    var bank = document.getElementById("bankSelect").value;
    isValid = markFieldValid("bankSelect", bank !== "") && isValid;
  } else if (method === "wallet") {
    var wallet = document.getElementById("walletProvider").value;
    isValid = markFieldValid("walletProvider", wallet !== "") && isValid;
  }

  form.classList.add("was-validated");
  return isValid;
}

function markFieldValid(fieldId, isFieldValid) {
  var field = document.getElementById(fieldId);
  field.classList.toggle("is-invalid", !isFieldValid);
  field.classList.toggle("is-valid", isFieldValid);
  return isFieldValid;
}

/* --------------------------------------------------------------------------
   SIMULATED PAYMENT FLOW
   -------------------------------------------------------------------------- */

function bindFormSubmit(courses) {
  var form = document.getElementById("checkoutForm");

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!validateCheckoutForm()) {
      var firstInvalid = form.querySelector(".is-invalid, :invalid");
      if (firstInvalid) firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setPayButtonProcessing(true);

    // Simulated network/processing delay so the state change is visible
    // (a real integration would await the payment gateway's response here).
    setTimeout(function () {
      var order = createOrder(courses);
      saveOrder(order);
      emSetJSON(EDUMATRIX_KEYS.cart, []); // clear the cart after a successful "purchase"
      window.location.href = "payment-success.html?order=" + order.id;
    }, 1400);
  });
}

function setPayButtonProcessing(isProcessing) {
  var btn = document.getElementById("paySecurelyBtn");
  var label = document.getElementById("paySecurelyLabel");
  var spinner = document.getElementById("paySecurelySpinner");

  btn.disabled = isProcessing;
  label.textContent = isProcessing ? "Processing…" : "Pay Securely";
  spinner.classList.toggle("d-none", !isProcessing);
}

function createOrder(courses) {
  var subtotal = courses.reduce(function (sum, c) { return sum + c.price; }, 0);

  return {
    id: generateOrderId(),
    date: new Date().toISOString(),
    paymentMethod: getSelectedPaymentMethod(),
    customer: {
      name: document.getElementById("fullName").value.trim(),
      email: document.getElementById("email").value.trim()
    },
    items: courses.map(function (course) {
      return {
        courseId: course.id,
        title: course.title,
        instructor: course.instructor,
        image: course.image,
        price: course.price
      };
    }),
    subtotal: subtotal,
    total: subtotal
  };
}

function generateOrderId() {
  var randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
  var timePart = Date.now().toString().slice(-5);
  return "EDU-" + timePart + randomPart;
}

function saveOrder(order) {
  var orders = emGetJSON(EDUMATRIX_KEYS.orders, []);
  orders.push(order);
  emSetJSON(EDUMATRIX_KEYS.orders, orders);
}
