const API = "http://localhost:5000/api";

async function request(url, method = "GET", body) {
  const res = await fetch(API + url, {
    method,
    headers: {
      "Content-Type": "application/json",
      "Authorization": localStorage.getItem("token")
    },
    body: body ? JSON.stringify(body) : null
  });

  return res.json();
}