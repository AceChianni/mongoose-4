// index.js

const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("./models/user");
const authenticate = require("./middleware/auth");
const { authorize, ROLE } = require("./middleware/role");

const app = express();
const port = process.env.PORT || 3000;

// Protected route
app.get("/protected", authenticate, (req, res) => {
  res.json({ message: "This is a protected route", user: req.user });
});

// Check environment variables
if (!process.env.JWT_SECRET) {
  console.error(
    "Error: JWT_SECRET is not defined in the environment variables."
  );
  process.exit(1);
}

if (!process.env.MONGO_DB_URI) {
  console.error(
    "Error: MONGO_DB_URI is not defined in the environment variables."
  );
  process.exit(1);
}

// middleware
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.send("Welcome to the server!");
});

// REGISTER USER
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

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = new User({ name, email, password: hashedPassword, role });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// LOGIN USER!!
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Compare passwords using bcrypt.compare (async/await)
    const isMatch = await bcrypt.compare(password, user.password);

    console.log("Passwords match:", isMatch); // This should log 'true' if they match

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate JWT token if passwords match
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Error during login:", error.message);
    res.status(500).json({ error: "An internal server error occurred" });
  }
});

// PROTECTED ROUTE
app.get("/dashboard", authenticate, (req, res) => {
  res.json({
    message: "Welcome to the dashboard!",
    user: req.user,
  });
});

// ADMIN ROUTE
app.get("/admin", authenticate, authorize([ROLE.ADMIN]), (req, res) => {
  res.json({
    message: "Welcome to the Admin Dashboard!",
    user: req.user,
  });
});

// START SERVER
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

// CONNECT MONGODB
mongoose
  .connect(process.env.MONGO_DB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });
