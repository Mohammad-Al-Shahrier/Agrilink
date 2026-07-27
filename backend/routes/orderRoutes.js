import express from "express";
import {
  createOrder,
  getMyOrders,
  getFarmerOrders,
  updateOrderStatus
} from "../controllers/orderController.js";
import protect from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(protect); // every order route requires a signed-in user

/* NOTE: /my-orders and /farmer must come before /:id/status routes
   so Express doesn't try to treat "my-orders"/"farmer" as an :id. */
router.get("/my-orders", authorize("customer"), getMyOrders);
router.get("/farmer", authorize("farmer"), getFarmerOrders);

router.post("/", authorize("customer"), createOrder);
router.put("/:id/status", authorize("farmer"), updateOrderStatus);

export default router;
