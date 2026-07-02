/* ================================================================
   controllers/productController.js  —  AgriLink

   Fixes:
   ① req.file.filename → saved as "uploads/filename.jpg" in MongoDB
   ② Image path built correctly so frontend can display it
   ③ All CRUD operations: create, getAll, getSingle, update, delete
   ④ ES Module syntax
================================================================ */

import fs      from "fs";
import path    from "path";
import { fileURLToPath } from "url";
import Product from "../models/Product.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

/* ================================================================
   HELPER — build image path saved to DB
   Always stored as:  "uploads/filename.jpg"
   Frontend builds:   http://localhost:5000/uploads/filename.jpg
================================================================ */
function buildImagePath(file) {
  if (!file) return "";
  /* file.filename is just "1234_name.jpg" (set by multer diskStorage) */
  return `uploads/${file.filename}`;
}

/* ================================================================
   CREATE PRODUCT
   POST /api/products
================================================================ */
export const createProduct = async (req, res) => {
  try {

    /* ── Log incoming data (remove in production) ── */
    console.log("📦 Body :", req.body);
    console.log("🖼️  File :", req.file);

    /* ── Validate file ── */
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Product image is required"
      });
    }

    const { pname, description, price, unit, stock, category } = req.body;

    /* ── Validate required fields ── */
    if (!pname || !price) {
      /* Delete uploaded file if validation fails */
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: "Product name and price are required"
      });
    }

    /* ── Build image path ── */
    const imagePath = buildImagePath(req.file);
    /* e.g. "uploads/1718000000_potato.jpg" */

    /* ── Create product ── */
    const product = await Product.create({
      pname:       pname.trim(),
      description: description?.trim() || "",
      price:       Number(price),
      unit:        unit || "kg",
      stock:       Number(stock) || 1,
      category:    category || "Vegetable",
      image:       imagePath,           /* ← saved to MongoDB */
      farmer:      req.user._id
    });

    console.log("✅ Product created:", product._id, "| image:", imagePath);

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      product
    });

  } catch (error) {
    console.error("createProduct error:", error);

    /* Clean up uploaded file on error */
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: error.message || "Server error"
    });
  }
};

/* ================================================================
   GET ALL PRODUCTS
   GET /api/products
================================================================ */
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product
      .find()
      .populate("farmer", "name farmName location phone")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success:  true,
      count:    products.length,
      products
    });

  } catch (error) {
    console.error("getAllProducts error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================================================================
   GET SINGLE PRODUCT
   GET /api/products/:id
================================================================ */
export const getSingleProduct = async (req, res) => {
  try {
    const product = await Product
      .findById(req.params.id)
      .populate("farmer", "name farmName location phone");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.status(200).json({ success: true, product });

  } catch (error) {
    console.error("getSingleProduct error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================================================================
   GET FARMER'S OWN PRODUCTS
   GET /api/products/my-products
================================================================ */
export const getFarmerProducts = async (req, res) => {
  try {
    const products = await Product
      .find({ farmer: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success:  true,
      count:    products.length,
      products
    });

  } catch (error) {
    console.error("getFarmerProducts error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================================================================
   UPDATE PRODUCT
   PUT /api/products/:id
================================================================ */
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    /* Only the farmer who created it can update */
    if (product.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const updates = { ...req.body };

    /* Handle new image upload */
    if (req.file) {
      /* Delete old image from disk */
      if (product.image) {
        const oldPath = path.join(__dirname, "..", product.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      updates.image = buildImagePath(req.file);
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Product updated",
      product: updated
    });

  } catch (error) {
    console.error("updateProduct error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================================================================
   DELETE PRODUCT
   DELETE /api/products/:id
================================================================ */
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    /* Only the farmer who created it can delete */
    if (product.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    /* Delete image file from disk */
    if (product.image) {
      const imgPath = path.join(__dirname, "..", product.image);
      if (fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath);
        console.log("🗑️  Deleted image:", imgPath);
      }
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: "Product deleted" });

  } catch (error) {
    console.error("deleteProduct error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};