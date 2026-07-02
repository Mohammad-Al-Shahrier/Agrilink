import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import protect from "../middleware/authMiddleware.js";

import {
  createProduct,
  getAllProducts,
  getSingleProduct,
  getFarmerProducts,
  updateProduct,
  deleteProduct
} from "../controllers/productController.js";

const router = express.Router();

/* ==========================================
   PUBLIC ROUTES
========================================== */

// Get all products
router.get("/", getAllProducts);

// ✅ MUST come before /:id — otherwise Express
//    treats "my-products" as an :id param
router.get(
  "/my-products",
  protect,
  getFarmerProducts
);

// Get single product by ID
router.get("/:id", getSingleProduct);

/* ==========================================
   PROTECTED ROUTES
========================================== */

// Add product
router.post(
  "/",
  protect,
  upload.single("image"),
  createProduct
);

// Update product
router.put(
  "/:id",
  protect,
  upload.single("image"),
  updateProduct
);

// Delete product
router.delete(
  "/:id",
  protect,
  deleteProduct
);

export default router;