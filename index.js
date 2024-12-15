const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("./models/users");

const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(express.json());

// Register a new user
app.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

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
