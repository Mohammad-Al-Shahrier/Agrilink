import express from "express";

import {
registerUser,
loginUser
}
from "../controllers/authController.js";

import validate from "../middleware/zodValidator.js";

import {
  registerSchema,
  loginSchema
} from "../validators/authSchema.js";

const router = express.Router();

// Register Route
router.post(
  "/register",
  validate(registerSchema),
  registerUser
);

// Login Route
router.post(
  "/login",
  validate(loginSchema),
  loginUser
);

export default router;