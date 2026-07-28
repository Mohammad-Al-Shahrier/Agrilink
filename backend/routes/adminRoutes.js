import express from "express";
import {
  getOverview,
  getAllUsers,
  setUserActiveStatus,
  setFarmerVerification,
  deleteUser
} from "../controllers/adminController.js";
import protect from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(protect, authorize("admin")); // every /api/admin/* route is admin-only

router.get("/overview", getOverview);

router.get("/users", getAllUsers);
router.put("/users/:id/block", setUserActiveStatus);
router.put("/users/:id/verify", setFarmerVerification);
router.delete("/users/:id", deleteUser);

export default router;
