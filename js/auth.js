let users = JSON.parse(localStorage.getItem("users")) || [];

function toggleFields() {
  let role = regRole.value;
  farmerFields.style.display = role === "farmer" ? "block" : "none";
  customerFields.style.display = role === "customer" ? "block" : "none";
}

function register() {
  let name = regName.value.trim();
  let email = regEmail.value.trim();
  let pass = regPass.value.trim();
  let role = regRole.value;

  if (!name || !email || !pass) return alert("All fields required!");

  if (users.find(u => u.email === email))
    return alert("User already exists!");

  let extraData =
    role === "farmer"
      ? { farmName: farmName.value, location: location.value }
      : { address: address.value };

  users.push({ name, email, password: pass, role, extraData });
  localStorage.setItem("users", JSON.stringify(users));

  alert("Account created!");
  location.href = "login.html";
}

function login() {
  let input = loginEmail.value.trim();
  let pass = loginPass.value.trim();

  let user = users.find(
    u => (u.email === input || u.name === input) && u.password === pass
  );

  if (!user) return alert("Invalid credentials!");

  localStorage.setItem("currentUser", JSON.stringify(user));
  location.href = "../index.html";
}