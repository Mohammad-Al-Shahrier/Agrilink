import Cart    from "../models/Cart.js";
import Order   from "../models/Order.js";
import Product from "../models/Product.js";

/* ================================================================
   POST /api/orders   — checkout the current cart
   body: { shippingAddress?, phone? }
================================================================ */
export const createOrder = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Your cart is empty" });
    }

    /* Validate stock is still available for every line item */
    for (const line of cart.items) {
      if (!line.product) {
        return res.status(400).json({ success: false, message: "One of the items in your cart no longer exists" });
      }
      if (line.product.stock > 0 && line.quantity > line.product.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${line.product.stock} ${line.product.unit || "kg"} of "${line.product.pname}" left in stock`
        });
      }
    }

    const items = cart.items.map(line => ({
      productId: line.product._id,
      farmer:    line.product.farmer,
      quantity:  line.quantity,
      price:     line.product.price
    }));

    const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const order = await Order.create({
      userId: req.user._id,
      items,
      totalAmount,
      shippingAddress: req.body.shippingAddress || req.user.address || "",
      phone: req.body.phone || req.user.phone || ""
    });

    /* Decrement stock for each purchased product */
    await Promise.all(
      cart.items.map(line =>
        Product.findByIdAndUpdate(line.product._id, {
          $inc: { stock: -line.quantity }
        })
      )
    );

    /* Clear the cart */
    cart.items = [];
    await cart.save();

    res.status(201).json({ success: true, message: "Order placed successfully", order });
  } catch (error) {
    console.error("createOrder error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================================================================
   GET /api/orders/my-orders   — customer's own order history
================================================================ */
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .populate("items.productId", "pname image unit price")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    console.error("getMyOrders error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================================================================
   GET /api/orders/farmer   — orders containing this farmer's products
   Each order is re-shaped to only show *this* farmer's line items
   and a totalAmount scoped to just those items.
================================================================ */
export const getFarmerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ "items.farmer": req.user._id })
      .populate("items.productId", "pname image unit price")
      .populate("userId", "name email phone")
      .sort({ createdAt: -1 });

    const scoped = orders.map(order => {
      const myItems = order.items.filter(
        i => i.farmer.toString() === req.user._id.toString()
      );
      const totalAmount = myItems.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0
      );

      return {
        _id: order._id,
        userId: order.userId,
        status: order.status,
        createdAt: order.createdAt,
        shippingAddress: order.shippingAddress,
        phone: order.phone,
        items: myItems,
        totalAmount
      };
    });

    res.status(200).json({ success: true, count: scoped.length, orders: scoped });
  } catch (error) {
    console.error("getFarmerOrders error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================================================================
   PUT /api/orders/:id/status   { status }
   A farmer may update the status of an order that contains at
   least one of their products (e.g. mark it "confirmed" or
   "delivered").
================================================================ */
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["pending", "confirmed", "delivered", "cancelled"];

    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const ownsAnItem = order.items.some(
      i => i.farmer.toString() === req.user._id.toString()
    );
    if (!ownsAnItem) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    order.status = status;
    await order.save();

    res.status(200).json({ success: true, message: "Order status updated", order });
  } catch (error) {
    console.error("updateOrderStatus error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
