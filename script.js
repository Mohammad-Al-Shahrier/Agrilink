let users = JSON.parse(localStorage.getItem("users")) || [];
let products = JSON.parse(localStorage.getItem("products")) || [];
let currentUser = JSON.parse(localStorage.getItem("currentUser"));

// TOGGLE ROLE
function toggleFields() {
  let role = document.getElementById("regRole").value;
  document.getElementById("farmerFields").style.display =
    role === "farmer" ? "block" : "none";
  document.getElementById("customerFields").style.display =
    role === "customer" ? "block" : "none";
}

// REGISTER
function register() {
  let name = document.getElementById("regName").value;
  let email = document.getElementById("regEmail").value;
  let pass = document.getElementById("regPass").value;
  let role = document.getElementById("regRole").value;

  if (!name || !email || !pass) {
    alert("All fields required!");
    return;
  }

  let extraData = {};
  if (role === "farmer") {
    extraData.farmName = document.getElementById("farmName").value;
    extraData.location = document.getElementById("location").value;
  } else {
    extraData.address = document.getElementById("address").value;
  }

  if (users.find(u => u.email === email)) {
    alert("User already exists!");
    return;
  }

  users.push({ name, email, password: pass, role, extraData });
  localStorage.setItem("users", JSON.stringify(users));

  alert("Account created!");
  window.location.href = "login.html";
}

// LOGIN
function login() {
  let input = document.getElementById("loginEmail").value;
  let pass = document.getElementById("loginPass").value;

  let user = users.find(
    u => (u.email === input || u.name === input) && u.password === pass
  );

  if (!user) {
    alert("Invalid credentials!");
    return;
  }

  localStorage.setItem("currentUser", JSON.stringify(user));
  alert("Login successful!");
  window.location.href = "index.html";
}

// SHOW FARMER PANEL
if (currentUser && currentUser.role === "farmer") {
  let panel = document.getElementById("farmerPanel");
  if (panel) panel.style.display = "block";
}

// ADD PRODUCT
function addProduct() {
  let name = document.getElementById("pname").value;
  let price = document.getElementById("pprice").value;
  let file = document.getElementById("pimage").files[0];

  if (!name || !price || !file) {
    alert("All fields required!");
    return;
  }

  let reader = new FileReader();
  reader.onload = function(e) {
    let newProduct = {
      pname: name,
      price: price,
      image: e.target.result
    };

    products.push(newProduct);
    localStorage.setItem("products", JSON.stringify(products));

    renderProducts();
  };

  reader.readAsDataURL(file);
}

// RENDER PRODUCTS
function renderProducts(list = products) {
  let container = document.getElementById("productList");
  if (!container) return;

  container.innerHTML = "";

  list.forEach(p => {
    let div = document.createElement("div");
    div.className = "card-product";
    div.innerHTML = `
      <img src="${p.image || 'https://via.placeholder.com/300'}">
      <h3>${p.pname}</h3>
      <p>${p.price}৳</p>
      <button onclick="buy()">Buy</button>
    `;
    container.appendChild(div);
  });
}

// SEARCH
let search = document.getElementById("search");
if (search) {
  search.addEventListener("input", function () {
    let value = this.value.toLowerCase();
    let filtered = products.filter(p =>
      p.pname.toLowerCase().includes(value)
    );
    renderProducts(filtered);
  });
}

// BUY
function buy() {
  if (!currentUser) {
    alert("Please login first!");
    window.location.href = "login.html";
    return;
  }

  alert("Order placed!");
}

renderProducts();