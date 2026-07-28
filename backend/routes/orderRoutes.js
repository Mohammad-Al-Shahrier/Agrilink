import express from "express";
import {
  createOrder,
  getMyOrders,
  getFarmerOrders,
<<<<<<< HEAD
  getAllOrders,
=======
>>>>>>> 6153e036b889b1351e7d1ee07225cee9016c15fd
  updateOrderStatus
} from "../controllers/orderController.js";
import protect from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
<<<<<<< HEAD
import validate from "../middleware/zodValidator.js";
import { updateOrderStatusSchema } from "../schemas/orderSchema.js";
=======
>>>>>>> 6153e036b889b1351e7d1ee07225cee9016c15fd

const router = express.Router();

router.use(protect); // every order route requires a signed-in user

<<<<<<< HEAD
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
=======
/* NOTE: /my-orders and /farmer must come before /:id/status routes
   so Express doesn't try to treat "my-orders"/"farmer" as an :id. */
router.get("/my-orders", authorize("customer"), getMyOrders);
router.get("/farmer", authorize("farmer"), getFarmerOrders);

router.post("/", authorize("customer"), createOrder);
router.put("/:id/status", authorize("farmer"), updateOrderStatus);
>>>>>>> 6153e036b889b1351e7d1ee07225cee9016c15fd

export default router;
