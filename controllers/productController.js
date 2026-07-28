/* ================================================================
   controllers/productController.js  —  AgriLink

   Fixes:
   ① req.file.filename → saved as "uploads/filename.jpg" in MongoDB
   ② Image path built correctly so frontend can display it
   ③ All CRUD operations: create, getAll, getSingle, update, delete
   ④ ES Module syntax
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

    /* Clean up uploaded file on error */
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
    });
  }
};

/* ================================================================
   GET ALL PRODUCTS
   GET /api/products
=======
      message: error.message || "Server error"
    });
  }
};

/* ================================================================
   GET ALL PRODUCTS
   GET /api/products
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
=======
    console.error("getAllProducts error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================================================================
   GET SINGLE PRODUCT
   GET /api/products/:id
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

  } catch (error) {
    console.error("getSingleProduct error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


/* ================================================================
   GET FARMER'S OWN PRODUCTS
   GET /api/products/my-products
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

    console.error("getFarmerProducts error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================================================================
   UPDATE PRODUCT
   PUT /api/products/:id


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