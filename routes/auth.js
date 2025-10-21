const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// ========================
// REGISTER ROUTE
// ========================
router.post("/register", async (req, res) => {
  try {

    const { name, regno, email, address, phone, password } = req.body;
     console.log("Received body:", req.body);

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Create and save new user
    const user = new User({ name, regno, email, address, phone, password });
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      message: "User registered successfully",
      token,
      username: user.name,
       user: {
        _id: user._id,
        name: user.name,
        regno: user.regno,
        email: user.email,
        address: user.address,
        phone: user.phone,
      },
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Server error during registration" });
  }
});

// ========================
// LOGIN ROUTE
// ========================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ error: "Invalid password" });

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      message: "Login successful",
      token,
      username: user.name,
      user: {
        _id: user._id,
        name: user.name,
        regno: user.regno,
        email: user.email,
        address: user.address,
        phone: user.phone,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
});


module.exports = router;
