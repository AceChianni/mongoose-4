const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("./models/user");

const app = express();
const port = process.env.PORT || 3000;

// JWT_SECRET is set
if (!process.env.JWT_SECRET) {
  console.error(
    "Error: JWT_SECRET is not defined in the environment variables."
  );
  process.exit(1);
}

// middleware
app.use(express.json());

// Register a new user
app.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create a new user
    const user = new User({ name, email, password, role });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login a user
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// start express server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

// connect to DB
const mongoDbUri = process.env.MONGO_DB_URI;

mongoose
  .connect(mongoDbUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });
