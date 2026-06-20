const API_BASE = "http://localhost:5000";

let _allProducts = [];

async function loadProducts(query = "") {
  try {
    const response = await fetch(`${API_BASE}/api/products`);
    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    const data = await response.json();
    _allProducts = data.products || data || [];
    filterAndRender(query);
  } catch (error) {
    console.error("Failed to load products:", error);
    renderProducts([]);
  }
}

function filterAndRender(query = "", category = "All") {
  let filtered = _allProducts;

  if (query.trim()) {
    const q = query.toLowerCase();
    filtered = filtered.filter(p =>
      (p.pname || p.name || "").toLowerCase().includes(q) ||
      (p.category || "").toLowerCase().includes(q)
    );
  }

  if (category && category !== "All") {
    filtered = filtered.filter(p => p.category === category);
  }

  renderProducts(filtered);
}

function renderProducts(products = []) {
  const container = document.getElementById("productList");
  if (!container) return;

  if (!products || !products.length) {
    container.innerHTML = `
      <div class="empty-products">
        <div class="empty-icon">🌿</div>
        <h2>No products found</h2>
        <p>Try a different search term or check back later.</p>
      </div>`;
    return;
  }

  const inPagesFolder = window.location.pathname.includes("/pages/");
  const detailsPath   = inPagesFolder ? "product-details.html" : "pages/product-details.html";
  const fallbackImg   = inPagesFolder ? "../images/placeholder.jpg" : "images/placeholder.jpg";

  container.innerHTML = products.map(product => {
    const id       = product._id || product.id || "";
    const name     = product.pname || product.name || "Unnamed";
    const price    = Number(product.price || 0).toLocaleString("en-BD");
    const unit     = product.unit || "kg";
    const category = product.category || "Vegetable";
    const stock    = Number(product.stock ?? product.quantity ?? 0);

    let imageUrl = fallbackImg;
    if (product.image) {
      imageUrl = product.image.startsWith("http")
        ? product.image
        : `${API_BASE}/${product.image.replace(/^\/+/, "")}`;
    }

    let stockPill = `<span class="stock-pill in">In stock</span>`;
    if (stock === 0) {
      stockPill = `<span class="stock-pill out">Out of stock</span>`;
    } else if (stock <= 10) {
      stockPill = `<span class="stock-pill low">Only ${stock} left</span>`;
    }

    const safeId   = String(id);
    const safeName = name.replace(/'/g, "\\'").replace(/"/g, "&quot;");

    return `
      <div
        class="card"
        onclick="goToDetails('${safeId}')"
        role="button"
        tabindex="0"
        aria-label="View details for ${name}"
        onkeydown="if(event.key==='Enter') goToDetails('${safeId}')"
        style="cursor:pointer"
        data-category="${category}"
      >
        <div class="card-img-wrap">
          <img
            src="${imageUrl}"
            alt="${name}"
            loading="lazy"
            onerror="this.src='${fallbackImg}'; this.onerror=null;"
          >
          ${stockPill}
        </div>

        <div class="card-body">
          <span class="category-tag">${category}</span>
          <h3 class="card-name">${name}</h3>
          <p class="price">৳${price}<span> / ${unit}</span></p>

          <div class="product-buttons">
            <button
              class="view-btn"
              onclick="event.stopPropagation(); goToDetails('${safeId}')"
              aria-label="View ${name}"
            >
              👁 Details
            </button>

            <button
              class="cart-btn"
              onclick="event.stopPropagation(); quickAddToCart('${safeId}', '${safeName}', this)"
              ${stock === 0 ? "disabled" : ""}
              aria-label="Add ${name} to cart"
            >
              🛒 Add to Cart
            </button>
          </div>
        </div>
      </div>`;
  }).join("");
}

function goToDetails(productId) {
  if (!productId) return;
  const inPagesFolder = window.location.pathname.includes("/pages/");
  const url = inPagesFolder
    ? `product-details.html?id=${productId}`
    : `pages/product-details.html?id=${productId}`;
  window.location.href = url;
}

async function quickAddToCart(productId, productName, btn) {
  const token       = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");

  if (!currentUser || !token) {
    alert("Please sign in to add items to your cart.");
    const inPagesFolder = window.location.pathname.includes("/pages/");
    window.location.href = inPagesFolder ? "login.html" : "pages/login.html";
    return;
  }

  const original = btn.innerHTML;
  btn.disabled   = true;
  btn.innerHTML  = "Adding…";

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

    btn.innerHTML        = "✅ Added!";
    btn.style.background = "#2e7d32";
    btn.style.color      = "#fff";

    setTimeout(() => {
      btn.innerHTML        = original;
      btn.style.background = "";
      btn.style.color      = "";
      btn.disabled         = false;
    }, 2000);

  } catch (error) {
    console.error("Cart error:", error);
    btn.innerHTML = "❌ Failed";
    setTimeout(() => {
      btn.innerHTML = original;
      btn.disabled  = false;
    }, 2000);
  }
}

document.addEventListener("DOMContentLoaded", () => loadProducts());