async function loadProducts() {

  try {

    const response =
      await fetch(
        "http://localhost:5000/api/products"
      );

    const data =
      await response.json();

    renderProducts(
      data.products
    );

  } catch (error) {

    console.log(error);
  }
}

function renderProducts(
  products = []
) {

  const container =
    document.getElementById(
      "productList"
    );

  if (!container) return;

  if (!products.length) {

    container.innerHTML =
      "<h2>No Products Found</h2>";

    return;
  }

  container.innerHTML =
    products.map(product => `

      <div class="card">

        <img
          src="http://localhost:5000/${product.image}"
          alt="${product.pname}"
        >

        <h3>${product.pname}</h3>

        <p>
          ৳ ${product.price}
        </p>

      </div>

    `).join("");
}

document.addEventListener(
  "DOMContentLoaded",
  loadProducts
);