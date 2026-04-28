// ================= GET PRODUCTS =================
function getProducts() {
  return JSON.parse(localStorage.getItem("products")) || [];
}

// ================= RENDER =================
function renderProducts(list = null) {

  const container = document.getElementById("productList");
  if (!container) return;

  const products = list || getProducts();

  container.innerHTML = "";

  if (products.length === 0) {
    container.innerHTML = "<p>No products available</p>";
    return;
  }

  products.forEach(p => {
    container.innerHTML += `
      <div class="card">
        <img src="${p.image || 'assets/images/default.png'}">
        <div class="card-body">
          <h3>${p.pname}</h3>
          <p class="price">${p.price}৳</p>

          <button onclick='addToCart(${JSON.stringify(p)})'>
            🛒 Add to Cart
          </button>
        </div>
      </div>
    `;
  });
}

// ================= ADD TO CART =================
function addToCart(product) {

  const user = JSON.parse(localStorage.getItem("currentUser"));

  if (!user) {
    alert("Login first!");
    location.href = "pages/login.html";
    return;
  }

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  cart.push({
    ...product,
    userEmail: user.email,
    qty: 1
  });

  localStorage.setItem("cart", JSON.stringify(cart));

  alert("🛒 Added to cart!");
}

// ================= SEARCH =================
const searchInput = document.getElementById("search");

if (searchInput) {
  searchInput.addEventListener("input", function () {

    const value = this.value.toLowerCase();
    const products = getProducts();

    const filtered = products.filter(p =>
      p.pname.toLowerCase().includes(value)
    );

    renderProducts(filtered);
  });
}

// ================= LOAD =================
renderProducts();