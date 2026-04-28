function toggleFields() {
  farmerFields.style.display = regRole.value === "farmer" ? "block" : "none";
  customerFields.style.display = regRole.value === "customer" ? "block" : "none";
}

function register() {
  const name = regName.value.trim();
  const email = regEmail.value.trim();
  const pass = regPass.value.trim();
  const role = regRole.value;

  if (!name || !email || !pass) return alert("All fields required!");

  let users = Storage.get("users");

  if (users.some(u => u.email === email)) {
    return alert("User exists!");
  }

  const user = {
    name,
    email,
    password: pass,
    role
  };

  users.push(user);
  Storage.set("users", users);

  alert("Account created!");
  location.href = "login.html";
}

function login() {
  const input = loginEmail.value.trim();
  const pass = loginPass.value.trim();

  const users = Storage.get("users");

  const user = users.find(
    u => (u.email === input || u.name === input) && u.password === pass
  );

  if (!user) return alert("Invalid!");

  localStorage.setItem("currentUser", JSON.stringify(user));
  location.href = "../index.html";
}