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