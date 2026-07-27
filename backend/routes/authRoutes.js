import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
import validate from "../middleware/zodValidator.js";
import { registerSchema, loginSchema } from "../schemas/authSchema.js";

const router = express.Router();

router.post("/register", validate(registerSchema), registerUser);
router.post("/login", validate(loginSchema), loginUser);

export default router;
