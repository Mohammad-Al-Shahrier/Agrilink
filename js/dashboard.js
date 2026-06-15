// ================= LOGIN CHECK =================

const user =
  JSON.parse(
    localStorage.getItem("currentUser")
  );

if (!user) {

  alert("Login first!");

  location.href =
    "login.html";
}

// ================= API =================

const API_URL =
  "http://localhost:5000/api";

const token =
  localStorage.getItem("token");

// ================= DOM =================

const sidebar =
  document.getElementById(
    "sidebarMenu"
  );

const title =
  document.getElementById(
    "dashboardTitle"
  );

const welcome =
  document.getElementById(
    "welcomeText"
  );

const stats =
  document.getElementById(
    "statsContainer"
  );

const table =
  document.getElementById(
    "dataTable"
  );

const tableTitle =
  document.getElementById(
    "tableTitle"
  );

// ================= SIDEBAR =================

if (user.role === "farmer") {

  sidebar.innerHTML = `

    <li>
      <a href="#" onclick="showProducts()">
        My Products
      </a>
    </li>

    <li>
      <a href="profile.html">
        Profile
      </a>
    </li>

    <li>
      <a href="#" onclick="logout()">
        Logout
      </a>
    </li>
  `;

} else {

  sidebar.innerHTML = `

    <li>
      <a href="profile.html">
        Profile
      </a>
    </li>

    <li>
      <a href="#" onclick="logout()">
        Logout
      </a>
    </li>
  `;
}

// ================= DASHBOARD =================

loadDashboard();

function loadDashboard() {

  if (user.role === "farmer") {

    title.innerText =
      "Farmer Dashboard";

    welcome.innerText =
      `Welcome ${user.name}`;

    showProducts();

  } else {

    title.innerText =
      "Customer Dashboard";

    welcome.innerText =
      `Welcome ${user.name}`;

    tableTitle.innerText =
      "Orders";

    table.innerHTML = `
      <tr>
        <td>
          Orders Feature Coming Soon
        </td>
      </tr>
    `;
  }
}

// ================= GET PRODUCTS =================

async function getProducts() {

  try {

    const response =
      await fetch(
        `${API_URL}/products/my-products`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

    const data =
      await response.json();

    return data.products || [];

  } catch (error) {

    console.log(error);

    return [];
  }
}

// ================= SHOW PRODUCTS =================

async function showProducts() {

  const products =
    await getProducts();

  tableTitle.innerText =
    "My Products";

  stats.innerHTML = `

    <div class="stat-card">

      <h3>Total Products</h3>

      <p>${products.length}</p>

    </div>
  `;

  table.innerHTML = `

    <div class="product-form">

      <input
        id="pname"
        placeholder="Product Name"
      >

      <input
        id="pprice"
        type="number"
        placeholder="Price"
      >

      <input
        type="file"
        id="pimage"
      >

      <button onclick="addProduct()">
        ➕ Add Product
      </button>

    </div>

    <thead>

      <tr>

        <th>Image</th>

        <th>Name</th>

        <th>Price</th>

        <th>Actions</th>

      </tr>

    </thead>

    <tbody>

      ${products.map(product => `

        <tr>

          <td>

            <img
              src="http://localhost:5000/${product.image}"
              class="table-img"
            >

          </td>

          <td>

            ${product.pname}

          </td>

          <td>

            ৳ ${product.price}

          </td>

          <td>

            <button
              class="action-btn"
              onclick="deleteProduct('${product._id}')"
            >
              🗑️ Delete
            </button>

          </td>

        </tr>

      `).join("")}

    </tbody>
  `;
}

// ================= ADD PRODUCT =================

async function addProduct() {

  const pname =
    document.getElementById(
      "pname"
    ).value.trim();

  const price =
    document.getElementById(
      "pprice"
    ).value.trim();

  const image =
    document.getElementById(
      "pimage"
    ).files[0];

  if (
    !pname ||
    !price ||
    !image
  ) {

    alert(
      "All fields required!"
    );

    return;
  }

  try {

    const formData =
      new FormData();

    formData.append(
      "pname",
      pname
    );

    formData.append(
      "price",
      price
    );

    formData.append(
      "description",
      ""
    );

    formData.append(
      "stock",
      1
    );

    formData.append(
      "category",
      "Vegetable"
    );

    formData.append(
      "image",
      image
    );

    const response =
      await fetch(
        `${API_URL}/products`,
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${token}`
          },

          body: formData
        }
      );

    const data =
      await response.json();

    if (!response.ok) {

      throw new Error(
        data.message
      );
    }

    alert(
      "✅ Product Added"
    );

    showProducts();

  } catch (error) {

    alert(
      error.message
    );
  }
}

// ================= DELETE PRODUCT =================

async function deleteProduct(id) {

  if (
    !confirm(
      "Delete this product?"
    )
  ) {
    return;
  }

  try {

    const response =
      await fetch(
        `${API_URL}/products/${id}`,
        {
          method: "DELETE",

          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

    const data =
      await response.json();

    if (!response.ok) {

      throw new Error(
        data.message
      );
    }

    alert(
      "✅ Product Deleted"
    );

    showProducts();

  } catch (error) {

    alert(
      error.message
    );
  }
}