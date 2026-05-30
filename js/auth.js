const API_URL = "http://localhost:5000/api/auth";

document
.getElementById("registerForm")
.addEventListener("submit", register);

async function register(e) {

  e.preventDefault();

  const userData = {

    name:
      document.getElementById("regName").value,

    email:
      document.getElementById("regEmail").value,

    password:
      document.getElementById("regPass").value,

    role:
      document.getElementById("regRole").value,

    farmName:
      document.getElementById("farmName").value,

    location:
      document.getElementById("location").value,

    address:
      document.getElementById("address").value
  };

  try {

    const response = await fetch(
      `${API_URL}/register`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify(userData)
      }
    );

    const data = await response.json();

    if (!response.ok) {

      alert(data.message);

      return;
    }

    alert("Registration Successful");

    window.location.href = "login.html";

  } catch (error) {

    console.log(error);

    alert("Server Error");
  }
}