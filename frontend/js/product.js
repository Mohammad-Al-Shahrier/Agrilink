/* ================================================================
   js/product.js  —  AgriLink
   
   Handles:
   ① Load all products from API
   ② Render beautiful product cards with skeleton loading
   ③ filterAndRender() — search + category (called by app.js & index.html)
   ④ goToDetails() — navigate to product-details page
   ⑤ quickAddToCart() — add to cart from homepage card
   
   Image URL pattern:
     MongoDB stores:  "uploads/1234_potato.jpg"
     URL becomes:     "http://localhost:5000/uploads/1234_potato.jpg"
================================================================ */

const API_BASE = window.API_BASE || "http://localhost:5000";

/* All loaded products — cached for client-side filter */
let _allProducts = [];

/* Farmers browse to see the marketplace, but only customers buy —
   used to grey out "Add to Cart" everywhere on this page. */
function _isFarmer() {
  const u = JSON.parse(localStorage.getItem("currentUser") || "null");
  return u?.role === "farmer";
}

/* ================================================================
   IMAGE URL BUILDER
   Handles every path format multer might store
================================================================ */
function buildProductImageUrl(path) {
  if (!path) return "images/placeholder.jpg";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const clean = path.replace(/^\/+/, "");
  if (clean.startsWith("uploads/")) return `${API_BASE}/${clean}`;
  return `${API_BASE}/uploads/${clean}`;
}

/* ================================================================
   LOAD PRODUCTS FROM API
================================================================ */
async function loadProducts() {
  showSkeleton();

  try {
    const res = await fetch(`${API_BASE}/api/products`);
    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    const data = await res.json();
    _allProducts = data.products || (Array.isArray(data) ? data : []);
    renderProducts(_allProducts);
  } catch (err) {
    console.error("[AgriLink] Failed to load products:", err);
    _allProducts = [];
    renderProducts([]);
  }
}

/* ================================================================
   SKELETON LOADER — shown while fetching
================================================================ */
function showSkeleton() {
  const container = document.getElementById("productList");
  if (!container) return;

  container.innerHTML = `
    <div class="skeleton-grid">
      ${Array(4).fill(`
        <div class="skel-card">
          <div class="skel skel-img"></div>
          <div class="skel-body">
            <div class="skel skel-tag"></div>
            <div class="skel skel-line"></div>
            <div class="skel skel-line short"></div>
            <div class="skel skel-btn"></div>
          </div>
        </div>`).join("")}
    </div>`;
}

/* ================================================================
   RENDER PRODUCT CARDS
================================================================ */
function renderProducts(products = []) {
  const container = document.getElementById("productList");
  if (!container) return;

  if (!products.length) {
    container.innerHTML = `
      <div class="empty-products">
        <div class="empty-icon">🌿</div>
        <h2>No products found</h2>
        <p>Try a different search or category.</p>
        <a href="index.html" class="empty-btn">← Back to Home</a>
      </div>`;
    return;
  }

  container.innerHTML = products.map(p => {
    const id       = p._id || p.id || "";
    const name     = p.pname || p.name || "Unnamed";
    const price    = Number(p.price || 0).toLocaleString("en-BD");
    const category = p.category || "Vegetable";
    const stock    = Number(p.stock ?? p.quantity ?? 0);
    const unit     = p.unit === "piece" ? "piece" : "kg";
    const imageUrl = buildProductImageUrl(p.image);

    /* Stock pill on image */
    let imgPill = "";
    if      (stock <= 0) imgPill = `<span class="stock-pill out">Out of stock</span>`;
    else if (stock <= 5) imgPill = `<span class="stock-pill low">⚡ Only ${stock} ${unit} left</span>`;
    /* No pill if plenty in stock — keeps image clean */

    /* Inline stock label in card body */
    let stockLabel = "";
    if      (stock <= 0) stockLabel = `<span class="card-stock out">Out of stock</span>`;
    else if (stock <= 5) stockLabel = `<span class="card-stock low">${stock} ${unit} left</span>`;
    else                 stockLabel = `<span class="card-stock in">✓ In stock</span>`;

    const farmerViewing = _isFarmer();
    const cartBtn = farmerViewing
      ? `<button class="cart-btn" disabled title="Farmer accounts can't purchase products">🚫 Farmers can't buy</button>`
      : `<button
              class="cart-btn"
              onclick="event.stopPropagation(); quickAddToCart('${id}', '${name.replace(/'/g, "\\'")}', this)"
              ${stock === 0 ? "disabled" : ""}
              aria-label="Add ${name} to cart"
            >🛒 Add to Cart</button>`;

    return `
      <div
        class="card"
        data-category="${category}"
        onclick="goToDetails('${id}')"
        role="button"
        tabindex="0"
        aria-label="View details for ${name}"
        onkeydown="if(event.key==='Enter') goToDetails('${id}')"
      >
        <!-- IMAGE -->
        <div class="card-img-wrap">
          <img
            src="${imageUrl}"
            alt="${name}"
            loading="lazy"
            onerror="this.src='images/placeholder.jpg'; this.onerror=null;"
          >
          ${imgPill}
        </div>

        <!-- BODY -->
        <div class="card-body">

          <!-- Category + Stock side by side -->
          <div class="card-meta">
            <span class="category-tag">${category}</span>
            ${stockLabel}
          </div>

          <h3 class="card-name">${name}</h3>

          <p class="price">
            ৳${price}<span class="price-unit"> / ${unit}</span>
          </p>

          <div class="product-buttons">
            <button
              class="view-btn"
              onclick="event.stopPropagation(); goToDetails('${id}')"
              aria-label="View details for ${name}"
            >👁 Details</button>

            ${cartBtn}
          </div>
        </div>
      </div>`;
  }).join("");
}

/* ================================================================
   FILTER AND RENDER — called by search input + category chips
   This function MUST be defined here so app.js and index.html
   can call:  filterAndRender(searchQuery, category)
================================================================ */
function filterAndRender(query = "", category = "All") {
  const q = query.toLowerCase().trim();

  const filtered = _allProducts.filter(p => {
    const name     = (p.pname || p.name || "").toLowerCase();
    const cat      = p.category || "Vegetable";
    const matchQ   = !q || name.includes(q);
    const matchCat = category === "All" || cat === category;
    return matchQ && matchCat;
  });

  renderProducts(filtered);
}

/* ================================================================
   NAVIGATE TO PRODUCT DETAILS PAGE
   Works from root (index.html) and from pages/ subfolder
================================================================ */
function goToDetails(productId) {
  if (!productId) return;
  const inPages = window.location.pathname.includes("/pages/");
  const base    = inPages ? "product-details.html" : "pages/product-details.html";
  window.location.href = `${base}?id=${productId}`;
}

/* ================================================================
   QUICK ADD TO CART — from homepage card without page change
================================================================ */
async function quickAddToCart(productId, productName, btn) {
  const token       = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");

  if (!currentUser || !token) {
    alert("Please sign in to add items to your cart.");
    window.location.href = "pages/login.html";
    return;
  }

  if (currentUser.role === "farmer") {
    alert("Farmer accounts can't purchase products. Please use a customer account to shop.");
    return;
  }

  const orig    = btn.innerHTML;
  btn.disabled  = true;
  btn.innerHTML = "Adding…";

  try {
    const res = await fetch(`${API_BASE}/api/cart`, {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ productId, quantity: 1 })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to add to cart");
    }

    btn.innerHTML = "✅ Added!";
    btn.style.background = "#1a4d2e";

    setTimeout(() => {
      btn.innerHTML        = orig;
      btn.style.background = "";
      btn.disabled         = false;
    }, 2000);

  } catch (err) {
    console.error("[AgriLink] Cart error:", err);
    btn.innerHTML = "❌ Error";
    setTimeout(() => {
      btn.innerHTML = orig;
      btn.disabled  = false;
    }, 2000);
  }
}

/* ================================================================
   AUTO-LOAD when DOM is ready
================================================================ */
document.addEventListener("DOMContentLoaded", loadProducts);