import User    from "../models/User.js";
import Product from "../models/Product.js";
import Order   from "../models/Order.js";

/* ================================================================
   HELPER — attach role-specific stats used by profile.js
   (productCount / ordersServed for farmers,
    orderCount / favoriteCount for customers)
================================================================ */
async function withStats(user) {
  const plain = user.toObject ? user.toObject() : { ...user };

  if (plain.role === "farmer") {
    const productCount = await Product.countDocuments({ farmer: plain._id });
    const ordersServed = await Order.countDocuments({ "items.farmer": plain._id });
    return { ...plain, productCount, ordersServed };
  }

  const orderCount = await Order.countDocuments({ userId: plain._id });
  return { ...plain, orderCount, favoriteCount: 0 };
}

/* ================================================================
   GET /api/users/me
================================================================ */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const data = await withStats(user);
    res.status(200).json(data);
  } catch (error) {
    console.error("getMe error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================================================================
   PUT /api/users/me
   body: { name?, phone?, farmName?, location?, address?, image? }
   `image` is a base64 data URL (frontend converts the file itself)
================================================================ */
export const updateMe = async (req, res) => {
  try {
    const { name, phone, farmName, location, address, image } = req.body;

    /* Base64 strings inflate ~33% over the original file — cap at
       4MB here so a 2.5MB upload (frontend limit) always clears it. */
    if (image && image.length > 4 * 1024 * 1024) {
      return res.status(413).json({ success: false, message: "Image is too large" });
    }

    const updates = {};
    if (name !== undefined)     updates.name = name.trim();
    if (phone !== undefined)    updates.phone = phone.trim();
    if (farmName !== undefined) updates.farmName = farmName.trim();
    if (location !== undefined) updates.location = location.trim();
    if (address !== undefined)  updates.address = address.trim();
    if (image !== undefined)    updates.profileImage = image;

    if (updates.name === "") {
      return res.status(400).json({ success: false, message: "Name can't be empty" });
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true
    }).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const data = await withStats(user);
    res.status(200).json(data);
  } catch (error) {
    console.error("updateMe error:", error);
    res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};
