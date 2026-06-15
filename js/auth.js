const API_URL =
"http://localhost:5000/api/auth";

const registerForm =
document.getElementById("registerForm");

if(registerForm){

registerForm.addEventListener(
"submit",
register
);

}

async function register(e){

e.preventDefault();

const userData = {

name:
document.getElementById("regName").value.trim(),

email:
document.getElementById("regEmail").value.trim(),

password:
document.getElementById("regPass").value,

role:
document.getElementById("regRole").value,

farmName:
document.getElementById("farmName")?.value || "",

location:
document.getElementById("location")?.value || "",

address:
document.getElementById("address")?.value || ""

};

try{

const response =
await fetch(
`${API_URL}/register`,
{
method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify(userData)
}
);

const data =
await response.json();

if(!response.ok){

alert(data.message);

return;
}

localStorage.setItem(
"token",
data.token
);

localStorage.setItem(
"currentUser",
JSON.stringify(data.user)
);

alert("Registration Successful");

window.location.href =
"login.html";

}catch(error){

console.log(error);

alert("Server Error");

}
}