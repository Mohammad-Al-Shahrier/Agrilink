import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ======================================
// REGISTER USER
// ======================================

export const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      farmName,
      location,
      address
    } = req.body;

    // ===============================
    // VALIDATION
    // ===============================

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, Email and Password are required"
      });
    }

    // ===============================
    // CHECK EXISTING USER
    // ===============================

    const existingUser = await User.findOne({
      email
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists"
      });
    }

    // ===============================
    // HASH PASSWORD
    // ===============================

    const salt = await bcrypt.genSalt(10);

    const hashedPassword =
      await bcrypt.hash(password, salt);

    // ===============================
    // CREATE USER
    // ===============================

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,

      role: role || "customer",

      farmName:
        role === "farmer"
          ? farmName
          : "",

      location:
        role === "farmer"
          ? location
          : "",

      address:
        role === "customer"
          ? address
          : ""
    });

    // ===============================
    // GENERATE JWT TOKEN
    // ===============================

    const token = jwt.sign(
      {
        id: newUser._id,
        email: newUser.email,
        role: newUser.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    // ===============================
    // RESPONSE
    // ===============================

    res.status(201).json({
      success: true,
      message: "Registration Successful",

      token,

      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        farmName: newUser.farmName,
        location: newUser.location,
        address: newUser.address,
        profileImage:
          newUser.profileImage
      }
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

// ======================================
// LOGIN USER
// ======================================

export const loginUser = async (req, res) => {

  try {

    const {
      email,
      password
    } = req.body;

    // ===============================
    // VALIDATION
    // ===============================

    if (!email || !password) {

      return res.status(400).json({
        success: false,
        message:
          "Email and Password required"
      });
    }

    // ===============================
    // FIND USER
    // ===============================

    const user =
      await User.findOne({ email });

    if (!user) {

      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // ===============================
    // CHECK PASSWORD
    // ===============================

    const isMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isMatch) {

      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // ===============================
    // GENERATE TOKEN
    // ===============================

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    // ===============================
    // RESPONSE
    // ===============================

    res.status(200).json({
      success: true,
      message: "Login Successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        farmName: user.farmName,
        location: user.location,
        address: user.address,
        profileImage:
          user.profileImage
      }
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};