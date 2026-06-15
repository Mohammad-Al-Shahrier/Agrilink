/* =====================================================
   product.js — AgriLink
   - Loads all products from API
   - Renders product cards on homepage
   - Click anywhere on card → pages/product-details.html?id=...
   - "Add to Cart" quick-adds without leaving the page
   - Live search (debounced) works from this file

    /* Fallback onerror path depends on where we are */
    const fallbackImg = inPagesFolder
      ? "../images/placeholder.jpg"
      : "images/placeholder.jpg";

    /* Stock pill */
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
          <p class="price">৳${price}<span> / kg</span></p>

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

/* =====================================================
   NAVIGATE TO PRODUCT DETAILS
   Works correctly whether called from index.html
   or from inside pages/ folder
