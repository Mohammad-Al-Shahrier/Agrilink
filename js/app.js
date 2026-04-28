const currentUser = JSON.parse(localStorage.getItem("currentUser"));

// ✅ FIXED HOME REDIRECT (works from any page)
function goHome() {
  window.location.href = window.location.pathname.includes("pages")
    ? "../index.html"
    : "index.html";
}

// NAVBAR UPDATE
const guestLinks = document.getElementById("guestLinks");
const userLinks = document.getElementById("userLinks");

if (currentUser) {
  guestLinks?.classList.add("hidden");
  userLinks?.classList.remove("hidden");
}

// LOGOUT
function logout() {
  localStorage.removeItem("currentUser");
  goHome();
}

// FARMER PANEL
const panel = document.getElementById("farmerPanel");
if (currentUser?.role === "farmer" && panel) {
  panel.classList.remove("hidden");
}

// SEARCH
const search = document.getElementById("search");

if (search) {
  search.addEventListener("input", e => {
    const value = e.target.value.toLowerCase();

    const products = JSON.parse(localStorage.getItem("products")) || [];

    const filtered = products.filter(p =>
      p.pname.toLowerCase().includes(value)
    );

    renderProducts(filtered);
  });
}

// OPTIONAL: hide dashboard for customer
const dashboardLink = document.getElementById("dashboardLink");
if (currentUser?.role !== "farmer" && dashboardLink) {
  dashboardLink.style.display = "none";
}