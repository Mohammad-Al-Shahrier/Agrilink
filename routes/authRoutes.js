import express from "express";
<<<<<<< HEAD
import { registerUser, loginUser } from "../controllers/authController.js";
import validate from "../middleware/zodValidator.js";
import { registerSchema, loginSchema } from "../schemas/authSchema.js";

const router = express.Router();

router.post("/register", validate(registerSchema), registerUser);
router.post("/login", validate(loginSchema), loginUser);

export default router;
=======

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

import validate from "../middleware/zodValidator.js";

import {
  registerSchema,
  loginSchema
} from "../validators/authSchema.js";

import validate from "../middleware/zodValidator.js";

import {
  registerSchema,
  loginSchema
} from "../validators/authSchema.js";

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
>>>>>>> 996f52fab8cbb13c1c980eb0f3f6865a3c35da21
