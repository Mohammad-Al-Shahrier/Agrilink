const productList = document.getElementById("productList");
const form = document.getElementById("productForm");

let products = Storage.get("products");

// ADD PRODUCT
if (form) {
  form.addEventListener("submit", e => {
    e.preventDefault();

    const name = pname.value.trim();
    const price = pprice.value.trim();
    const file = pimage.files[0];

    if (!name || !price || !file) {
      return alert("All fields required!");
    }

    const reader = new FileReader();

    reader.onload = () => {
      const product = {
        id: Date.now(),
        pname: name,
        price,
        image: reader.result
      };

      products.push(product);
      Storage.set("products", products);

      renderProducts();
      form.reset();
    };

    reader.readAsDataURL(file);
  });
}

// RENDER
function renderProducts(list = products) {
  if (!productList) return;

  productList.innerHTML = "";

  list.forEach(p => {
    productList.innerHTML += `
      <div class="card">
        <img src="${p.image || 'images/tomato.webp'}">
        <div class="card-body">
          <h3>${p.pname}</h3>
          <p class="price">${p.price}৳</p>
          <button class="buy-btn">Buy</button>
        </div>
      </div>
    `;
  });
}

// BUY
document.addEventListener("click", e => {
  if (e.target.classList.contains("buy-btn")) {
    const user = JSON.parse(localStorage.getItem("currentUser"));

    if (!user) {
      alert("Login first!");
      location.href = "pages/login.html";
      return;
    }

    alert("Order placed!");
  }
});

renderProducts();