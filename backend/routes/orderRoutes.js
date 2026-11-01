const requireAdmin = require("../middleware/adminAuth");
const express = require("express");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const Menu = require("../models/Menu");

const router = express.Router();

// PLACE A CUSTOMER ORDER
router.post("/", async (req, res) => {
  try {
    const { customerName, phone, address, items } = req.body;

    if (
      !customerName?.trim() ||
      !phone?.trim() ||
      !address?.trim() ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide customer details and cart items.",
      });
    }

    const orderItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const menuItemId = item.menuItemId || item._id;
      const quantity = Number(item.quantity);

      if (
        !mongoose.isValidObjectId(menuItemId) ||
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > 50
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid menu item or quantity.",
        });
      }

      const dish = await Menu.findById(menuItemId);

      if (!dish || dish.isAvailable === false) {
        return res.status(400).json({
          success: false,
          message: "A selected dish is unavailable.",
        });
      }

      orderItems.push({
        menuItem: dish._id,
        name: dish.name,
        price: dish.price,
        quantity,
      });

      totalAmount += dish.price * quantity;
    }

    const order = await Order.create({
      customerName: customerName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      items: orderItems,
      totalAmount,
    });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      data: order,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return res.status(500).json({
      success: false,
      message: "Could not place your order.",
    });
  }
});

// GET ALL ORDERS
router.get("/", requireAdmin, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("Fetch orders error:", error);
    return res.status(500).json({
      success: false,
      message: "Could not fetch orders.",
    });
  }
});

 // TRACK A CUSTOMER ORDER
router.get("/track/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID.",
      });
    }

    const order = await Order.findById(id).select(
      "_id status items totalAmount createdAt"
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    return res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Track order error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Could not track your order.",
    });
  }
});

// UPDATE AN ORDER'S STATUS
router.patch("/:id/status", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "Placed",
      "Preparing",
      "Out for Delivery",
      "Delivered",
      "Cancelled",
    ];

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID.",
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status.",
      });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    return res.json({
      success: true,
      message: "Order status updated successfully.",
      data: order,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    return res.status(500).json({
      success: false,
      message: "Could not update order status.",
    });
  }
});

module.exports = router;
