import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import {
  createProduct,
  getAllProducts,
  getSingleProduct,
  getFarmerProducts,
  updateProduct,
  deleteProduct
} from "../controllers/productController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getAllProducts);
router.get("/my-products", protect, getFarmerProducts);
router.get("/:id", getSingleProduct);

router.post(
  "/",
  protect,
  upload.single("image"),
  createProduct
);

router.put(
  "/:id",
  protect,
  upload.single("image"),
  updateProduct
);

router.delete(
  "/:id",
  protect,
  deleteProduct
);

export default router;