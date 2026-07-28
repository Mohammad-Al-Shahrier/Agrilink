import mongoose from "mongoose";

/* ================================================================
   ORDER ITEM
   Snapshot fields (farmer) are stored directly so we can filter
   "my orders" for a farmer without having to populate + re-walk
   every product on every request.
================================================================ */
const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number, // unit price at time of order
      required: true
    }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: v => Array.isArray(v) && v.length > 0
    },
    totalAmount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "delivered", "cancelled"],
      default: "pending"
    },
    shippingAddress: {
      type: String,
      default: ""
    },
    phone: {
      type: String,
      default: ""
    },
    paymentMethod: {
      type: String,
      enum: ["cod"],
      default: "cod"
    }
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
