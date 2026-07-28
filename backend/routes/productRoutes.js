import express from "express";
import {
  createProduct,
  getAllProducts,
  getSingleProduct,
  getFarmerProducts,
  updateProduct,
  deleteProduct
} from "../controllers/productController.js";
import protect from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

/* ── Public ── */
router.get("/", getAllProducts);

/* ── Farmer-only ──
   NOTE: /my-products must be declared BEFORE /:id, otherwise
   Express would match it as getSingleProduct with id="my-products". */
router.get("/my-products", protect, authorize("farmer"), getFarmerProducts);

router.get("/:id", getSingleProduct);

router.post("/", protect, authorize("farmer"), upload.single("image"), createProduct);
router.put("/:id", protect, authorize("farmer"), upload.single("image"), updateProduct);
router.delete("/:id", protect, authorize("farmer"), deleteProduct);

export default router;
