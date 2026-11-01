const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Menu = require("./models/Menu");
const orderRoutes = require("./routes/orderRoutes");
const app = express();
const PORT = process.env.PORT || 5000;
const adminRoutes = require("./routes/adminRoutes");
app.use(cors());
app.use(express.json());

app.use("/api/admin", adminRoutes);
app.use("/api/orders", orderRoutes);


// Home route
app.get("/", (req, res) => {
  res.send("Welcome to Kandari Dhabha API!");
});

// Backend health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Kandari Dhabha backend is running!"
  });
});

// Get menu items from MongoDB
app.get("/api/menu", async (req, res) => {
  try {
    const dishes = await Menu.find({ isAvailable: true });

    res.json({
      success: true,
      count: dishes.length,
      data: dishes
    });
  } catch (error) {
    console.error("Menu fetch failed:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch menu"
    });
  }
});

// Connect to MongoDB and start server
async function startServer() {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error("MONGODB_URI is missing from backend/.env");
    }

    await mongoose.connect(mongoUri);
    console.log("MongoDB connected successfully!");

    app.listen(PORT, () => {
      console.log(
        `Kandari Dhabha server running on http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
  }
}

startServer();
