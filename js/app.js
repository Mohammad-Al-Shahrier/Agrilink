const currentUser = JSON.parse(localStorage.getItem("currentUser"));

// HOME
function goHome() {
  location.href = "index.html";
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

    const products = Storage.get("products");

    const filtered = products.filter(p =>
let currentUser = JSON.parse(localStorage.getItem("currentUser"));

// LOGO CLICK → HOME
function goHome() {
  window.location.href = "index.html";
}

// SHOW FARMER PANEL
if (currentUser?.role === "farmer") {
  let panel = document.getElementById("farmerPanel");
  if (panel) panel.style.display = "block";
}

// SEARCH
let search = document.getElementById("search");
if (search) {
  search.addEventListener("input", function () {
    let value = this.value.toLowerCase();
    let products = JSON.parse(localStorage.getItem("products")) || [];

    let filtered = products.filter(p =>
      p.pname.toLowerCase().includes(value)
    );

    renderProducts(filtered);
  });
}
}

renderProducts();
