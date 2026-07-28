<<<<<<< HEAD
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
import mongoose from "mongoose";
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
=======
import Product from "../models/Product.js";

// ======================================
// CREATE PRODUCT
// ======================================

export const createProduct = async (req, res) => {
  try {

    const {
      pname,
      description,
      price,
      stock,
      category
    } = req.body;

    if (!pname || !price) {
>>>>>>> 996f52fab8cbb13c1c980eb0f3f6865a3c35da21
      return res.status(400).json({
        success: false,
        message: "Product name and price are required"
      });
    }

<<<<<<< HEAD
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

=======
    const product = await Product.create({
      pname: pname.trim(),
      description: description || "",
      price: Number(price),
      stock: Number(stock) || 1,
      category: category || "Vegetable",
      image: req.file
        ? `uploads/products/${req.file.filename}`
        : "",
      farmer: req.user._id
    });

>>>>>>> 996f52fab8cbb13c1c980eb0f3f6865a3c35da21
    res.status(201).json({
      success: true,
      message: "Product added successfully",
      product
    });

  } catch (error) {
<<<<<<< HEAD
    console.error("createProduct error:", error);

    /* Clean up uploaded file on error */
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: error.message || "Server error"
=======

    console.error("CREATE PRODUCT ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message
>>>>>>> 996f52fab8cbb13c1c980eb0f3f6865a3c35da21
    });
  }
};

<<<<<<< HEAD
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
=======
// ======================================
// GET ALL PRODUCTS
// ======================================

export const getAllProducts = async (req, res) => {
  try {

    const products = await Product.find()
      .populate(
        "farmer",
        "name email farmName location"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
>>>>>>> 996f52fab8cbb13c1c980eb0f3f6865a3c35da21
      products
    });

  } catch (error) {
<<<<<<< HEAD
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
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const product = await Product
      .findById(req.params.id)
      .populate("farmer", "name farmName location phone");
=======

    console.error("GET PRODUCTS ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ======================================
// GET SINGLE PRODUCT
// ======================================

export const getSingleProduct = async (req, res) => {
  try {

    const product = await Product.findById(
      req.params.id
    ).populate(
      "farmer",
      "name email farmName location"
    );
>>>>>>> 996f52fab8cbb13c1c980eb0f3f6865a3c35da21

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

<<<<<<< HEAD
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
=======
    res.status(200).json({
      success: true,
      product
    });

  } catch (error) {

    console.error("GET SINGLE PRODUCT ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ======================================
// GET FARMER PRODUCTS
// ======================================

export const getFarmerProducts = async (
  req,
  res
) => {
  try {

    const products = await Product.find({
      farmer: req.user._id
    }).sort({
      createdAt: -1
    });

    res.status(200).json({
      success: true,
      count: products.length,
>>>>>>> 996f52fab8cbb13c1c980eb0f3f6865a3c35da21
      products
    });

  } catch (error) {
<<<<<<< HEAD
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
=======

    console.error("GET FARMER PRODUCTS ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ======================================
// UPDATE PRODUCT
// ======================================

export const updateProduct = async (
  req,
  res
) => {
  try {

    let product = await Product.findById(
      req.params.id
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    if (
      product.farmer.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access"
      });
    }

    const updateData = {
      ...req.body
    };

    if (updateData.price) {
      updateData.price =
        Number(updateData.price);
    }

    if (updateData.stock) {
      updateData.stock =
        Number(updateData.stock);
    }

    if (req.file) {
      updateData.image =
        `uploads/products/${req.file.filename}`;
    }

    product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
>>>>>>> 996f52fab8cbb13c1c980eb0f3f6865a3c35da21
    );

    res.status(200).json({
      success: true,
<<<<<<< HEAD
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
=======
      message: "Product updated successfully",
      product
    });

  } catch (error) {

    console.error("UPDATE PRODUCT ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ======================================
// DELETE PRODUCT
// ======================================

export const deleteProduct = async (
  req,
  res
) => {
  try {

    const product = await Product.findById(
      req.params.id
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    if (
      product.farmer.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access"
      });
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: "Product deleted successfully"
    });

  } catch (error) {

    console.error("DELETE PRODUCT ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
>>>>>>> 996f52fab8cbb13c1c980eb0f3f6865a3c35da21
  }
};