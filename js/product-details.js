const API_BASE = "http://localhost:5000";

const container = document.getElementById("productDetails");

let currentQuantity = 1;
let currentProduct  = null;

/* =====================================================
   HELPERS
===================================================== */
function unitLabel(u) {
  return u === "piece" ? "piece" : "kg";
}

function getStockBadge(stock, unit) {
  const u = unitLabel(unit);
  if (stock <= 0) return `<span class="stock-badge out-of-stock">Out of Stock</span>`;
  if (stock <= 5) return `<span class="stock-badge low-stock">Only ${stock} ${u} left</span>`;
  return `<span class="stock-badge in-stock">In Stock</span>`;
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d)) return null;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function showError(message) {
  container.innerHTML = `
    <div class="error-state">
      <h2>${message}</h2>
      <a href="../index.html">← Back to Home</a>
    </div>`;
}

function updateTotalDisplay() {
  if (!currentProduct) return;
  const u     = unitLabel(currentProduct.unit);
  const total = (currentProduct.price * currentQuantity).toFixed(2);
  document.getElementById("totalPrice").textContent = `৳${total}`;
  document.getElementById("unitNote").textContent   = `(${currentQuantity} ${u} × ৳${currentProduct.price})`;
}

/* =====================================================
   LOAD PRODUCT
===================================================== */
async function loadProductDetails() {
  const params    = new URLSearchParams(window.location.search);
  const productId = params.get("id");

  if (!productId) { showError("Product not found"); return; }

  try {
    const response = await fetch(`${API_BASE}/api/products/${productId}`);
    const data     = await response.json();

    if (!response.ok) throw new Error(data.message || "Failed to load product");

    const product   = data.product;
    currentProduct  = product;
    currentQuantity = 1;

    const unit    = unitLabel(product.unit);
    const inStock = product.stock > 0;
    const addedOn = formatDate(product.createdAt);

    let imageUrl = "../images/placeholder.jpg";
    if (product.image) imageUrl = `${API_BASE}/${product.image}`;

    const metaItems = [
      { label: "Category",         value: product.category || "N/A" },
      { label: "Unit",             value: unit === "piece" ? "🔢 Piece" : "⚖️ kg" },
      { label: "Stock Available",  value: `${product.stock} ${unit}` },
      ...(addedOn ? [{ label: "Listed On", value: addedOn }] : [])
    ];

    container.innerHTML = `
      <div class="product-details-card">

        <div class="product-image-wrapper">
          <img
            src="${imageUrl}"
            alt="${product.pname}"
            onerror="this.src='../images/placeholder.jpg'"
          >
          ${getStockBadge(product.stock, product.unit)}
        </div>

        <div class="details-info">

          <span class="category-tag">${product.category || "Product"}</span>
          <h1>${product.pname}</h1>

          <div class="price-row">
            <span class="price">৳${product.price}</span>
            <span class="price-unit">/ ${unit}</span>
          </div>

          <div class="product-id">Product ID: ${product._id}</div>

          <p class="description">
            ${product.description || "No description available"}
          </p>

          <hr>

          <div class="meta-grid">
            ${metaItems.map(m => `
              <div class="meta-item">
                <span class="meta-label">${m.label}</span>
                <span class="meta-value">${m.value}</span>
              </div>`).join("")}
          </div>

          <hr>

          <div class="farmer-info">
            <h3>👨‍🌾 Farmer Information</h3>
            <p><strong>Name:</strong> ${product.farmer?.name || "Unknown"}</p>
            <p><strong>Farm:</strong> ${product.farmer?.farmName || "N/A"}</p>
            <p><strong>Location:</strong> ${product.farmer?.location || "N/A"}</p>
            ${product.farmer?.phone ? `<p><strong>Contact:</strong> ${product.farmer.phone}</p>` : ""}
          </div>

          <div class="cart-actions">

            <div class="quantity-row">
              <span class="qty-label">Quantity</span>
              <div class="quantity-selector">
                <button onclick="changeQuantity(-1)" ${!inStock ? "disabled" : ""}>−</button>
                <span id="qtyValue">1</span>
                <button onclick="changeQuantity(1)"  ${!inStock ? "disabled" : ""}>+</button>
              </div>
              <span class="qty-unit">${unit}</span>
            </div>

            <div class="total-price">
              Total: <strong id="totalPrice">৳${product.price}</strong>
              <span id="unitNote" class="unit-note">(1 ${unit} × ৳${product.price})</span>
            </div>

            <div class="action-buttons">
              <button
                id="addCartBtn"
                onclick="addToCart('${product._id}')"
                class="cart-btn"
                ${!inStock ? "disabled" : ""}
              >
                ${inStock ? "🛒 Add to Cart" : "Out of Stock"}
              </button>

              <button
                id="buyNowBtn"
                onclick="buyNow('${product._id}')"
                class="buy-btn"
                ${!inStock ? "disabled" : ""}
              >
                ${inStock ? "⚡ Buy Now" : "Unavailable"}
              </button>
            </div>

          </div>

        </div>
      </div>`;

  } catch (error) {
    console.error(error);
    showError(error.message);
  }
}

/* =====================================================
   QUANTITY
===================================================== */
function changeQuantity(delta) {
  if (!currentProduct) return;
  const newQty = currentQuantity + delta;
  const maxQty = currentProduct.stock;
  if (newQty < 1 || newQty > maxQty) return;
  currentQuantity = newQty;
  document.getElementById("qtyValue").textContent = currentQuantity;
  updateTotalDisplay();
}

/* =====================================================
   CART HELPERS
===================================================== */
function requireLogin() {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please login first");
    window.location.href = "login.html";
    return null;
  }
  return token;
}

async function postToCart(token, productId, quantity) {
  const response = await fetch(`${API_BASE}/api/cart`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization:  `Bearer ${token}`
    },
    body: JSON.stringify({ productId, quantity })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to update cart");
  return data;
}

/* =====================================================
   ADD TO CART
===================================================== */
async function addToCart(productId) {
  const token = requireLogin();
  if (!token) return;

  const btn = document.getElementById("addCartBtn");
  const originalHTML = btn.innerHTML;
  btn.disabled  = true;
  btn.innerHTML = "Adding...";

  try {
    await postToCart(token, productId, currentQuantity);
    btn.classList.add("added");
    btn.innerHTML = "✅ Added!";
    setTimeout(() => {
      btn.classList.remove("added");
      btn.innerHTML = originalHTML;
      btn.disabled  = false;
    }, 1500);
  } catch (error) {
    alert(error.message);
    btn.disabled  = false;
    btn.innerHTML = originalHTML;
  }
}

/* =====================================================
   BUY NOW
===================================================== */
async function buyNow(productId) {
  const token = requireLogin();
  if (!token) return;

  const btn = document.getElementById("buyNowBtn");
  const originalHTML = btn.innerHTML;
  btn.disabled  = true;
  btn.innerHTML = "Processing...";

  try {
    await postToCart(token, productId, currentQuantity);
    window.location.href = "cart.html";
  } catch (error) {
    alert(error.message);
    btn.disabled  = false;
    btn.innerHTML = originalHTML;
  }
}

loadProductDetails();