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

        <div class="card-body">
          <span class="category-tag">${category}</span>
          <h3 class="card-name">${name}</h3>
          <p class="price">৳${price}<span> / ${unit}</span></p>

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

            <button
              class="cart-btn"
              onclick="event.stopPropagation(); quickAddToCart('${id}', '${name.replace(/'/g, "\\'")}', this)"
              ${stock === 0 ? "disabled" : ""}
              aria-label="Add ${name} to cart"
            >🛒 Add to Cart</button>
          </div>
        </div>
      </div>`;
  }).join("");
}

/* ================================================================
   FILTER AND RENDER — called by search input + category chips
   This function MUST be defined here so app.js and index.html
   can call:  filterAndRender(searchQuery, category)
async function quickAddToCart(productId, productName, btn) {
  const token       = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");

  if (!currentUser || !token) {
    alert("Please sign in to add items to your cart.");
    window.location.href = "pages/login.html";
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
