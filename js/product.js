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