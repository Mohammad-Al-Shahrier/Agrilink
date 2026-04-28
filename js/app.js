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
      p.pname.toLowerCase().includes(value)
    );

    renderProducts(filtered);
  });
}