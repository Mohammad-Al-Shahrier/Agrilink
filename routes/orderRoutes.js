import express from "express";
import {
  createOrder,
  getMyOrders,
  getFarmerOrders,
  getAllOrders,
  updateOrderStatus
} from "../controllers/orderController.js";
import protect from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import validate from "../middleware/zodValidator.js";
import { updateOrderStatusSchema } from "../schemas/orderSchema.js";

const router = express.Router();

router.use(protect); // every order route requires a signed-in user

/* NOTE: /my-orders, /farmer and /admin/all must come before
   /:id/status routes so Express doesn't try to treat them as an :id. */
router.get("/my-orders", authorize("customer"), getMyOrders);
router.get("/farmer", authorize("farmer"), getFarmerOrders);
router.get("/admin/all", authorize("admin"), getAllOrders);

router.post("/", authorize("customer"), createOrder);
router.put(
  "/:id/status",
  authorize("farmer", "admin"),
  validate(updateOrderStatusSchema),
  updateOrderStatus
);

export default router;
