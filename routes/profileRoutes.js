import express from "express";
import User from "../models/User.js";
import protect from "../middleware/authMiddleware.js";

/* =====================================================
   PROFILE ROUTES
   Mounted in server.js as:  app.use("/api/users", profileRoutes);

   GET  /api/users/me   → fetch logged-in user's profile
   PUT  /api/users/me   → update profile fields + avatar

   ⚠️ Assumes authMiddleware.js exports the JWT-verifying
   middleware as a DEFAULT export:
       export default function protect(req, res, next) { ... }
   and that it sets req.user = { id: <userId>, ... }.
===================================================== */

const router = express.Router();

/* -----------------------------------------------------
   GET /api/users/me
   Returns the current user's profile (no password).
----------------------------------------------------- */
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error("GET /users/me error:", err);
    res.status(500).json({ message: "Server error while fetching profile." });
  }
});

/* -----------------------------------------------------
   PUT /api/users/me
   Updates name, phone, role-specific fields, and/or
   profileImage (base64 data URL string).
   Email and role are intentionally NOT editable here.
----------------------------------------------------- */
router.put("/me", protect, async (req, res) => {
  try {
    const { name, phone, image, farmName, location, address } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Only touch fields that were actually sent in the request body —
    // this lets the avatar-only save (from the camera button) update
    // just the image without wiping out other fields.
    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ message: "Name can't be empty." });
      }
      user.name = name.trim();
    }

    if (phone !== undefined) user.phone = phone.trim();

    if (image !== undefined) {
      if (image && !image.startsWith("data:image/")) {
        return res.status(400).json({ message: "Invalid image format." });
      }
      // Guard against documents exceeding MongoDB's 16MB limit
      if (image && image.length > 4 * 1024 * 1024) {
        return res.status(400).json({ message: "Image is too large. Please use a smaller photo." });
      }
      user.profileImage = image;
    }

    // Role-specific fields — only relevant ones are saved per role,
    // but we don't hard-block the others in case roles change later.
    if (user.role === "farmer") {
      if (farmName !== undefined) user.farmName = farmName.trim();
      if (location !== undefined) user.location = location.trim();
    } else {
      if (address !== undefined) user.address = address.trim();
    }

    await user.save();

    const updatedUser = user.toObject();
    delete updatedUser.password;

    res.status(200).json(updatedUser);
  } catch (err) {
    console.error("PUT /users/me error:", err);

    if (err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }

    res.status(500).json({ message: "Server error while updating profile." });
  }
});

export default router;