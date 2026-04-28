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
let products = JSON.parse(localStorage.getItem("products")) || [];
let currentUser = JSON.parse(localStorage.getItem("currentUser"));

function addProduct() {
  let name = pname.value;
  let price = pprice.value;
  let file = pimage.files[0];

  if (!name || !price || !file) return alert("All fields required!");

  let reader = new FileReader();
  reader.onload = function (e) {
    products.push({
      pname: name,
      price: price,
      image: e.target.result,
    });

    localStorage.setItem("products", JSON.stringify(products));
    renderProducts();
  };
  reader.readAsDataURL(file);
}

function renderProducts(list = products) {
  let container = document.getElementById("productList");
  if (!container) return;

  container.innerHTML = "";

  list.forEach(p => {
    container.innerHTML += `
      <div class="card-product">
        <img src="${p.image || 'images/tomato.webp'}">
        <h3>${p.pname}</h3>
        <p>${p.price}৳</p>
        <button onclick="buy()">Buy</button>
      </div>`;
  });
}

function buy() {
  if (!currentUser) {
    alert("Please login first!");
    location.href = "pages/login.html";
    return;
  }
  alert("Order placed!");
}
