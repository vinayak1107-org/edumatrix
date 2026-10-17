/* ==========================================================================
   EduMatrix — pricing.js
   Switches the Pro plan's displayed price between monthly and yearly
   billing. Free and Enterprise prices don't change, so they're left
   static in the markup.
   ========================================================================== */

var EM_PRO_PRICE = {
  monthly: { amount: "$29", suffix: "/mo", note: "billed monthly" },
  yearly: { amount: "$23", suffix: "/mo", note: "billed yearly ($278/year) · save 20%" }
};

document.addEventListener("DOMContentLoaded", function () {
  var monthlyBtn = document.getElementById("monthlyToggleBtn");
  var yearlyBtn = document.getElementById("yearlyToggleBtn");

  monthlyBtn.addEventListener("click", function () { setBillingPeriod("monthly"); });
  yearlyBtn.addEventListener("click", function () { setBillingPeriod("yearly"); });
});

function setBillingPeriod(period) {
  var pricing = EM_PRO_PRICE[period];

  document.getElementById("proPrice").textContent = pricing.amount;
  document.getElementById("proPrice").nextElementSibling.textContent = pricing.suffix;
  document.getElementById("proBillingNote").textContent = pricing.note;

  document.getElementById("monthlyToggleBtn").classList.toggle("is-active", period === "monthly");
  document.getElementById("yearlyToggleBtn").classList.toggle("is-active", period === "yearly");
}
