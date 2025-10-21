const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const jwt = require("jsonwebtoken");

// ✅ Middleware to verify token
const authMiddleware = (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.replace("Bearer ", "");
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

// ✅ Create a product (Sell / Lost)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, description, price, imageUrl, category } = req.body;

    if (!title || !category) {
      return res.status(400).json({ error: "Title and category are required" });
    }

    const product = new Product({
      title,
      description,
      price,
      imageUrl,
      category,
      user: req.userId,
    });

    await product.save();
    res.status(201).json({ message: "Product created successfully", product });
  } catch (err) {
    console.error("Error creating product:", err);
    res.status(500).json({ error: "Server error while creating product" });
  }
});

// ✅ Get all 'sale' products
router.get("/sale", async (req, res) => {
  try {
    const products = await Product.find({ category: "sale" }).sort({ createdAt: -1 }).populate("user", "name regno phone");;
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Error fetching products" });
  }
});
// ✅ Get all 'lost' products with user info
router.get("/lost", async (req, res) => {
  try {
    // Populate the 'user' field with name, regno, and phone
    const products = await Product.find({ category: "lost" })
      .sort({ createdAt: -1 })
      .populate("user", "name regno phone"); // <-- important!

    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching lost items" });
  }
});


module.exports = router;
