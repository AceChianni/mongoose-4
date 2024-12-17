const mongoose = require("mongoose");
const User = require("./models/user");
require("dotenv").config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("Connected to MongoDB");
    const result = await User.deleteMany({}); // Deletes all user records
    console.log(`${result.deletedCount} user(s) deleted.`);
    process.exit(); // Exit the script
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1);
  });
