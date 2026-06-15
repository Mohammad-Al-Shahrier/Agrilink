const API_BASE = "http://localhost:5000";

const container = document.getElementById("productDetails");

let currentQuantity = 1;
let currentProduct  = null;

/* ---------- Helpers ---------- */

function getStockBadge(stock) {
    if (stock <= 0) return `<span class="stock-badge out-of-stock">Out of Stock</span>`;
    if (stock <= 5) return `<span class="stock-badge low-stock">Only ${stock} left</span>`;
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
        </div>
    `;
}

/* ---------- Load Product ---------- */

async function loadProductDetails() {

    const params    = new URLSearchParams(window.location.search);
    const productId = params.get("id");

    if (!productId) {
        showError("Product not found");
        return;
    }

    try {

        const response = await fetch(`${API_BASE}/api/products/${productId}`);
        const data     = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to load product");
        }

        const product   = data.product;
        currentProduct  = product;
        currentQuantity = 1;

        let imageUrl = "../images/placeholder.jpg";
        if (product.image) imageUrl = `${API_BASE}/${product.image}`;

        const inStock  = product.stock > 0;
        const addedOn  = formatDate(product.createdAt);

        /* Optional extra fields (rendered only if present) */
        const extraMeta = [];
        if (product.unit)     extraMeta.push({ label: "Unit",       value: product.unit });
        if (addedOn)          extraMeta.push({ label: "Listed On",  value: addedOn });
        extraMeta.push({ label: "Category", value: product.category || "N/A" });
        extraMeta.push({ label: "Stock Available", value: `${product.stock} kg` });

        container.innerHTML = `
            <div class="product-details-card">

                <div class="product-image-wrapper">
                    <img
                        src="${imageUrl}"
                        alt="${product.pname}"
                        onerror="this.src='../images/placeholder.jpg'"
                    >
                    ${getStockBadge(product.stock)}
                </div>

                <div class="details-info">

                    <span class="category-tag">${product.category || "Product"}</span>

                    <h1>${product.pname}</h1>

                    <div class="price-row">
                        <span class="price">৳${product.price}</span>
                        <span>/ kg</span>
                    </div>

                    <div class="product-id">Product ID: ${product._id}</div>

                    <p class="description">
                        ${product.description || "No description available"}
                    </p>

                    <hr>

                    <div class="meta-grid">
                        ${extraMeta.map(m => `
                            <div class="meta-item">
                                <span class="meta-label">${m.label}</span>
                                <span class="meta-value">${m.value}</span>
                            </div>
                        `).join("")}
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
                        <div class="quantity-selector">
                            <button onclick="changeQuantity(-1)" ${!inStock ? "disabled" : ""}>−</button>
                            <span id="qtyValue">1</span>
                            <button onclick="changeQuantity(1)" ${!inStock ? "disabled" : ""}>+</button>
                        </div>

                        <div class="total-price">
                            Total: <strong id="totalPrice">৳${product.price}</strong>
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

            </div>
        `;

    } catch (error) {
        console.error(error);
        showError(error.message);
    }
}

/* ---------- Quantity ---------- */

function changeQuantity(delta) {
    if (!currentProduct) return;

    const newQty = currentQuantity + delta;
    const maxQty = currentProduct.stock;

    if (newQty < 1 || newQty > maxQty) return;

    currentQuantity = newQty;
    document.getElementById("qtyValue").textContent = currentQuantity;
    document.getElementById("totalPrice").textContent =
        `৳${(currentProduct.price * currentQuantity).toFixed(2)}`;
}

/* ---------- Cart helpers ---------- */

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
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ productId, quantity })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to update cart");
    }

    return data;
}

/* ---------- Add to Cart ---------- */

async function addToCart(productId) {

    const token = requireLogin();
    if (!token) return;

    const btn = document.getElementById("addCartBtn");
    const originalText = btn.textContent;

    btn.disabled = true;
    btn.textContent = "Adding...";

    try {
        await postToCart(token, productId, currentQuantity);

        btn.classList.add("added");
        btn.textContent = "✅ Added!";

        setTimeout(() => {
            btn.classList.remove("added");
            btn.textContent = originalText;
            btn.disabled = false;
        }, 1500);

    } catch (error) {
        alert(error.message);
        btn.disabled = false;
        btn.textContent = originalText;
    }
}

/* ---------- Buy Now ---------- */

async function buyNow(productId) {

    const token = requireLogin();
    if (!token) return;

    const btn = document.getElementById("buyNowBtn");
    const originalText = btn.textContent;

    btn.disabled = true;
    btn.textContent = "Processing...";

    try {
        await postToCart(token, productId, currentQuantity);

        // Send straight to cart/checkout with this item ready
        window.location.href = "cart.html";

    } catch (error) {
        alert(error.message);
        btn.disabled = false;
        btn.textContent = originalText;
    }
}

loadProductDetails();