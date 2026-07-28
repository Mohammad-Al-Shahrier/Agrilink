/* =====================================================
   app.js — AgriLink
   Responsibilities:
     1. Navbar state (guest / logged-in / farmer)
     2. Farmer panel visibility
     3. Live search — delegates to product.js filterAndRender()
     4. Logout
     5. goHome() helper
   NOTE: Product loading & rendering lives in product.js
===================================================== */

const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");

/* =====================================================
   HOME REDIRECT — works from any depth
===================================================== */
function goHome() {
  const inPages = window.location.pathname.includes("/pages/");
  window.location.href = inPages ? "../index.html" : "index.html";
}

/* =====================================================
   LOGOUT
===================================================== */
function logout() {
  localStorage.removeItem("currentUser");
  localStorage.removeItem("token");
  goHome();
}

/* =====================================================
   NAVBAR STATE
===================================================== */
function updateNavbar() {
  const guestLinks = document.getElementById("guestLinks");
  const userLinks  = document.getElementById("userLinks");
  if (guestLinks && userLinks) {
    if (currentUser) {
      guestLinks.classList.add("hidden");
      userLinks.classList.remove("hidden");
    } else {
      guestLinks.classList.remove("hidden");
      userLinks.classList.add("hidden");
    }
  }

  /* "Dashboard" means different things per role:
     farmers manage their products/orders, admins approve orders
     platform-wide, customers just want their own order history.
     Point every .dashboard-link on the page at the right
     destination instead of hardcoding one. */
  if (currentUser) {
    const inPages = window.location.pathname.includes("/pages/");
    const page = currentUser.role === "farmer" ? "dashboard.html"
      : currentUser.role === "admin"           ? "admin.html"
      :                                           "orders.html";
    const target = inPages ? page : `pages/${page}`;

    document.querySelectorAll(".dashboard-link, #dashboardLink").forEach(link => {
      link.setAttribute("href", target);
    });

    /* Farmers and admins don't shop — hide the Cart link rather
       than let it bounce them straight back out of the page. */
    document.querySelectorAll(".cart-link").forEach(link => {
      link.style.display = (currentUser.role === "farmer" || currentUser.role === "admin") ? "none" : "";
    });
  }
}

/* =====================================================
   FARMER PANEL
===================================================== */
function updateFarmerPanel() {
  const panel = document.getElementById("farmerPanel");
  if (!panel) return;
  if (currentUser?.role === "farmer") {
    panel.classList.remove("hidden");
  }
}

/* =====================================================
   LIVE SEARCH — debounced 300 ms
   Calls filterAndRender() defined in product.js
===================================================== */
function initSearch() {
  const searchInput = document.getElementById("search");
  if (!searchInput) return;

  let debounce;
  searchInput.addEventListener("input", () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      /* filterAndRender is defined in product.js */
      if (typeof filterAndRender === "function") {
        filterAndRender(searchInput.value.trim());
      }
    }, 300);
  });
}

/* =====================================================
   INIT
===================================================== */
updateNavbar();
updateFarmerPanel();
initSearch();