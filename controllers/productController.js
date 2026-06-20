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
      return res.status(400).json({
        success: false,
        message: "Product name and price are required"
      });
    }

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

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      product
    });

  } catch (error) {

    console.error("CREATE PRODUCT ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

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
      products
    });

  } catch (error) {

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

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

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
      products
    });

  } catch (error) {

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
    );

    res.status(200).json({
      success: true,
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
  }
};