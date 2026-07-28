import User    from "../models/User.js";
import Product from "../models/Product.js";
import Order   from "../models/Order.js";

/* ================================================================
   GET /api/admin/overview
   Platform-wide numbers for the admin dashboard's overview tab.
================================================================ */
export const getOverview = async (req, res) => {
  try {
    const [
      totalUsers,
      totalFarmers,
      totalCustomers,
      totalProducts,
      totalOrders,
      pendingOrders,
      orders
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "farmer" }),
      User.countDocuments({ role: "customer" }),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.countDocuments({ status: "pending" }),
      Order.find({ status: { $ne: "cancelled" } }, "totalAmount")
    ]);

    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

    res.status(200).json({
      success: true,
      overview: {
        totalUsers,
        totalFarmers,
        totalCustomers,
        totalProducts,
        totalOrders,
        pendingOrders,
        totalRevenue
      }
    });
  } catch (error) {
    console.error("getOverview error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================================================================
   GET /api/admin/users?role=&search=
   List every user for the admin dashboard's Users tab.
================================================================ */
export const getAllUsers = async (req, res) => {
  try {
    const filter = {};
    const { role, search } = req.query;

    if (role && ["farmer", "customer", "admin"].includes(role)) {
      filter.role = role;
    }
    if (search) {
      const safe = String(search).slice(0, 100);
      filter.$or = [
        { name:  { $regex: safe, $options: "i" } },
        { email: { $regex: safe, $options: "i" } }
      ];
    }

    const users = await User.find(filter).select("-password").sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    console.error("getAllUsers error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================================================================
   PUT /api/admin/users/:id/block   { isActive: boolean }
   Suspend or reinstate a farmer/customer account. Admins can't be
   blocked through this endpoint (protects against locking out the
   only admin, and against one admin disabling another by mistake).
================================================================ */
export const setUserActiveStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    if (typeof isActive !== "boolean") {
      return res.status(400).json({ success: false, message: "isActive must be true or false" });
    }

    const target = await User.findById(req.params.id);
    if (!target) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (target.role === "admin") {
      return res.status(403).json({ success: false, message: "Admin accounts can't be blocked here" });
    }
    if (target._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "You can't block your own account" });
    }

    target.isActive = isActive;
    await target.save();

    res.status(200).json({
      success: true,
      message: isActive ? "User reinstated" : "User suspended",
      user: { _id: target._id, isActive: target.isActive }
    });
  } catch (error) {
    console.error("setUserActiveStatus error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================================================================
   PUT /api/admin/users/:id/verify   { isVerified: boolean }
   Mark a farmer's account as verified (shown as a trust badge).
================================================================ */
export const setFarmerVerification = async (req, res) => {
  try {
    const { isVerified } = req.body;
    if (typeof isVerified !== "boolean") {
      return res.status(400).json({ success: false, message: "isVerified must be true or false" });
    }

    const target = await User.findById(req.params.id);
    if (!target) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (target.role !== "farmer") {
      return res.status(400).json({ success: false, message: "Only farmer accounts can be verified" });
    }

    target.isVerified = isVerified;
    await target.save();

    res.status(200).json({
      success: true,
      message: isVerified ? "Farmer verified" : "Verification removed",
      user: { _id: target._id, isVerified: target.isVerified }
    });
  } catch (error) {
    console.error("setFarmerVerification error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================================================================
   DELETE /api/admin/users/:id
   Removes a user account. Admin accounts and the caller's own
   account are protected from deletion via this route.
================================================================ */
export const deleteUser = async (req, res) => {
  try {
    const target = await User.findById(req.params.id);
    if (!target) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (target.role === "admin") {
      return res.status(403).json({ success: false, message: "Admin accounts can't be deleted here" });
    }
    if (target._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "You can't delete your own account" });
    }

    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "User deleted" });
  } catch (error) {
    console.error("deleteUser error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
