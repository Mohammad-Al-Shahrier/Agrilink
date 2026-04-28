const user = JSON.parse(localStorage.getItem("currentUser"));
const card = document.getElementById("profileCard");

if (!user) {
  alert("Login first!");
  location.href = "login.html";
}

// PROFILE UI
card.innerHTML = `
  <div style="
    background:white;
    padding:30px;
    border-radius:15px;
    max-width:400px;
    margin:auto;
    box-shadow:0 5px 15px rgba(0,0,0,0.1);
  ">
    <h2>${user.name}</h2>
    <p><strong>Email:</strong> ${user.email}</p>
    <p><strong>Role:</strong> ${user.role}</p>

    ${
      user.role === "farmer"
        ? `
          <p><strong>Farm:</strong> ${user.extraData?.farmName || "N/A"}</p>
          <p><strong>Location:</strong> ${user.extraData?.location || "N/A"}</p>
        `
        : `
          <p><strong>Address:</strong> ${user.extraData?.address || "N/A"}</p>
        `
    }
  </div>
`;