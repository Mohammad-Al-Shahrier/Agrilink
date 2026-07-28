import Cart    from "../models/Cart.js";
import Product from "../models/Product.js";

/* ================================================================
   HELPER — find (or lazily create) the current user's cart
================================================================ */
async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
}

/* ================================================================
   HELPER — shape a populated cart for the frontend:
   { items: [{ productId, product: {...}, quantity, subtotal }], totalItems, totalAmount }
================================================================ */
async function buildCartResponse(userId) {
  const cart = await Cart.findOne({ user: userId }).populate({
    path: "items.product",
    select: "pname price image stock unit category farmer"
  });

  if (!cart) {
    return { items: [], totalItems: 0, totalAmount: 0 };
  }

  /* Drop items whose product was deleted since being added */
  const validItems = cart.items.filter(i => i.product);

  const items = validItems.map(i => ({
    productId: i.product._id,
    product:   i.product,
    quantity:  i.quantity,
    subtotal:  Number(i.product.price || 0) * i.quantity
  }));

  const totalItems  = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalAmount = items.reduce((sum, i) => sum + i.subtotal, 0);

  return { items, totalItems, totalAmount };
}

/* ================================================================
   GET /api/cart
================================================================ */
export const getCart = async (req, res) => {
  try {
    const data = await buildCartResponse(req.user._id);
    res.status(200).json({ success: true, ...data });
  } catch (error) {
    console.error("getCart error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================================================================
   POST /api/cart   { productId, quantity }
   Adds an item, or increments quantity if it already exists.
================================================================ */
export const addToCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const quantity = Math.max(1, Number(req.body.quantity) || 1);

    if (!productId) {
      return res.status(400).json({ success: false, message: "productId is required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (product.farmer.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "You can't buy your own product" });
    }

    const cart = await getOrCreateCart(req.user._id);
    const existing = cart.items.find(i => i.product.toString() === productId);

    const nextQty = (existing ? existing.quantity : 0) + quantity;
    if (product.stock > 0 && nextQty > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} ${product.unit || "kg"} of "${product.pname}" left in stock`
      });
    }

    if (existing) {
      existing.quantity = nextQty;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();

    const data = await buildCartResponse(req.user._id);
    res.status(200).json({ success: true, message: "Added to cart", ...data });
  } catch (error) {
    console.error("addToCart error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================================================================
   PUT /api/cart/:productId   { quantity }
================================================================ */
export const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const quantity = Number(req.body.quantity);

    if (!Number.isFinite(quantity)) {
      return res.status(400).json({ success: false, message: "A valid quantity is required" });
    }

    const cart = await getOrCreateCart(req.user._id);
    const item = cart.items.find(i => i.product.toString() === productId);

    if (!item) {
      return res.status(404).json({ success: false, message: "Item not in cart" });
    }

    if (quantity <= 0) {
      cart.items = cart.items.filter(i => i.product.toString() !== productId);
    } else {
      const product = await Product.findById(productId);
      if (product && product.stock > 0 && quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} ${product.unit || "kg"} left in stock`
        });
      }
      item.quantity = quantity;
    }

    await cart.save();

    const data = await buildCartResponse(req.user._id);
    res.status(200).json({ success: true, ...data });
  } catch (error) {
    console.error("updateCartItem error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================================================================
   DELETE /api/cart/:productId
================================================================ */
export const removeCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const cart = await getOrCreateCart(req.user._id);

    cart.items = cart.items.filter(i => i.product.toString() !== productId);
    await cart.save();

    const data = await buildCartResponse(req.user._id);
    res.status(200).json({ success: true, message: "Item removed", ...data });
  } catch (error) {
    console.error("removeCartItem error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================================================================
   DELETE /api/cart   — clear entire cart
================================================================ */
export const clearCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    cart.items = [];
    await cart.save();
    res.status(200).json({ success: true, message: "Cart cleared", items: [], totalItems: 0, totalAmount: 0 });
  } catch (error) {
    console.error("clearCart error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
