import express from "express";
<<<<<<< HEAD
=======
import upload from "../middleware/uploadMiddleware.js";
import protect from "../middleware/authMiddleware.js";

>>>>>>> 996f52fab8cbb13c1c980eb0f3f6865a3c35da21
import {
  createProduct,
  getAllProducts,
  getSingleProduct,
  getFarmerProducts,
  updateProduct,
  deleteProduct
} from "../controllers/productController.js";
<<<<<<< HEAD
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
=======

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
>>>>>>> 996f52fab8cbb13c1c980eb0f3f6865a3c35da21
