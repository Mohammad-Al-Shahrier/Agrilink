import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// REGISTER

export const registerUser = async (req,res)=>{

try{

const {
  name,
  email,
  password,
  role,
  farmName,
  location,
  address
}=req.body;

if(!name || !email || !password){

  return res.status(400).json({
    success:false,
    message:"All required fields missing"
  });
}

const existingUser =
await User.findOne({email});

if(existingUser){

  return res.status(400).json({
    success:false,
    message:"Email already registered"
  });
}

<<<<<<< HEAD
/* SECURITY: never trust a client-supplied "admin" role at signup —
   only "farmer" is allowed to be chosen explicitly, everything else
   (including no role, or someone POSTing role:"admin") falls back
   to "customer". Admin accounts must be created directly in the
   database/by another admin, never through public registration. */
const safeRole = role === "farmer" ? "farmer" : "customer";

=======
>>>>>>> 996f52fab8cbb13c1c980eb0f3f6865a3c35da21
const hashedPassword =
await bcrypt.hash(password,10);

const user =
await User.create({

  name,
  email,
  password:hashedPassword,
<<<<<<< HEAD
  role:safeRole,

  farmName:
  safeRole==="farmer" ? farmName : "",

  location:
  safeRole==="farmer" ? location : "",

  address:
  safeRole==="customer" ? address : ""
=======
  role,

  farmName:
  role==="farmer" ? farmName : "",

  location:
  role==="farmer" ? location : "",

  address:
  role==="customer" ? address : ""
>>>>>>> 996f52fab8cbb13c1c980eb0f3f6865a3c35da21

});

const token = jwt.sign(
{
  id:user._id,
  role:user.role
},
process.env.JWT_SECRET,
{
  expiresIn:"7d"
}
);

res.cookie("token",token,{
  httpOnly:true,
<<<<<<< HEAD
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
=======
>>>>>>> 996f52fab8cbb13c1c980eb0f3f6865a3c35da21
  maxAge:7*24*60*60*1000
});

res.status(201).json({

  success:true,
  message:"Registration Successful",

  token,

  user:{
    id:user._id,
    name:user.name,
    email:user.email,
    role:user.role
  }
});

}catch(error){

console.log(error);

res.status(500).json({
  success:false,
  message:error.message
});

}
};

// LOGIN

export const loginUser = async (req,res)=>{

try{

const {email,password}=req.body;

const user =
await User.findOne({email});

if(!user){

  return res.status(404).json({
    success:false,
    message:"User not found"
  });
}

const match =
await bcrypt.compare(
password,
user.password
);

if(!match){

  return res.status(401).json({
    success:false,
    message:"Invalid Password"
  });
}

const token = jwt.sign(
{
  id:user._id,
  role:user.role
},
process.env.JWT_SECRET,
{
  expiresIn:"7d"
}
);

res.cookie("token",token,{
  httpOnly:true,
<<<<<<< HEAD
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
=======
>>>>>>> 996f52fab8cbb13c1c980eb0f3f6865a3c35da21
  maxAge:7*24*60*60*1000
});

res.status(200).json({

  success:true,
  message:"Login Successful",

  token,

  user:{
    id:user._id,
    name:user.name,
    email:user.email,
    role:user.role
  }
});

}catch(error){

<<<<<<< HEAD
console.error("Login error:", error.message);

res.status(500).json({
  success:false,
  message:"Server error. Please try again."
=======
res.status(500).json({
  success:false,
  message:error.message
>>>>>>> 996f52fab8cbb13c1c980eb0f3f6865a3c35da21
});

}
};