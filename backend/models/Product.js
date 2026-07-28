import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    pname: {
      type: String,
      required: [true, "Product name is required"],
      trim: true
    },

    description: {
      type: String,
      default: ""
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: 0
    },

    unit: {
      type: String,
      enum: ["kg", "piece"],
      default: "kg"
    },

    stock: {
      type: Number,
      default: 1
    },

    category: {
      type: String,
      default: "Vegetable"
    },

    image: {
      type: String,
      default: ""
    },

    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    status: {
      type: String,
      enum: ["available", "out_of_stock"],
      default: "available"
    }
  },
  {
    timestamps: true
  }
);

const Product = mongoose.model("Product", productSchema);

export default Product;