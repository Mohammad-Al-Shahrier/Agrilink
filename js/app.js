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

renderProducts();