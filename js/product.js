// ===============================
// GET PRODUCTS
// ===============================

function getProducts() {

  return JSON.parse(
    localStorage.getItem("products")
  ) || [];
}

// ===============================
// RENDER PRODUCTS
// ===============================

function renderProducts(list = null) {

  const container =
    document.getElementById("productList");

  if (!container) return;

  const products =
    list || getProducts();

  container.innerHTML = "";

  // EMPTY PRODUCTS
  if (products.length === 0) {

    container.innerHTML = `

      <div class="empty-products">

        <h2>
          No Products Available 😔
        </h2>

      </div>
    `;

    return;
  }

  // LOOP PRODUCTS
  products.forEach((product, index) => {

    container.innerHTML += `

      <div class="card">

        <!-- IMAGE -->
        <img
          src="${product.image}"
          alt="${product.pname}"
        >

        <!-- BODY -->
        <div class="card-body">

          <h3>
            ${product.pname}
          </h3>

          <p class="price">
            ৳ ${product.price}
          </p>

          <!-- BUTTONS -->
          <div class="product-buttons">

            <button
              class="view-btn"
              onclick="viewProduct(${index})"
            >
              👁 View
            </button>

            <button
              class="cart-btn"
              onclick="addToCart(${index})"
            >
              🛒 Cart
            </button>

          </div>

        </div>

      </div>
    `;
  });
}

// ===============================
// VIEW PRODUCT
// ===============================

function viewProduct(index) {

  const products = getProducts();

  const product = products[index];

  localStorage.setItem(
    "selectedProduct",
    JSON.stringify(product)
  );

  location.href =
    "pages/product-details.html";
}

// ===============================
// ADD TO CART
// ===============================

function addToCart(index) {

  // USER
  const currentUser =
    JSON.parse(
      localStorage.getItem("currentUser")
    );

  // LOGIN CHECK
  if (!currentUser) {

    alert("Please login first!");

    location.href =
      "pages/login.html";

    return;
  }

  // PRODUCTS
  const products = getProducts();

  const product = products[index];

  // CART
  let cart =
    JSON.parse(
      localStorage.getItem("cart")
    ) || [];

  // EXIST CHECK
  const existingProduct =
    cart.find(item =>

      item.userEmail === currentUser.email &&

      item.pname === product.pname
    );

  // IF EXISTS
  if (existingProduct) {

    existingProduct.qty += 1;

    existingProduct.total =
      existingProduct.qty *
      Number(existingProduct.price);

  } else {

    // NEW PRODUCT
    cart.push({

      id: Date.now(),

      pname: product.pname,

      price: Number(product.price),

      image: product.image,

      qty: 1,

      total: Number(product.price),

      userEmail: currentUser.email
    });
  }

  // SAVE
  localStorage.setItem(
    "cart",
    JSON.stringify(cart)
  );

  alert("🛒 Product added to cart!");
}

// ===============================
// SEARCH
// ===============================

const searchInput =
  document.getElementById("search");

if (searchInput) {

  searchInput.addEventListener(
    "input",
    function () {

      const value =
        this.value.toLowerCase();

      const products =
        getProducts();

      const filteredProducts =
        products.filter(product =>

          product.pname
            .toLowerCase()
            .includes(value)
        );

      renderProducts(filteredProducts);
    }
  );
}

// ===============================
// INITIAL LOAD
// ===============================

document.addEventListener(
  "DOMContentLoaded",
  function () {

    renderProducts();
  }
);