
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      !process.env.ADMIN_USERNAME ||
      !process.env.ADMIN_PASSWORD ||
      !process.env.JWT_SECRET
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid login request or server configuration.",
      });
    }

    const usernameMatches =
      username === process.env.ADMIN_USERNAME;

    // Supports either a bcrypt-hashed password or a plain .env
    // password for the initial local setup.
    const configuredPassword = process.env.ADMIN_PASSWORD;
    const isBcryptHash = /^\$2[aby]\$/.test(configuredPassword);

    const passwordMatches = isBcryptHash
      ? await bcrypt.compare(password, configuredPassword)
      : password === configuredPassword;

    if (!usernameMatches || !passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Incorrect username or password.",
      });
    }

    const token = jwt.sign(
      { role: "admin", username: process.env.ADMIN_USERNAME },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    return res.json({
      success: true,
      message: "Admin login successful.",
      token,
    });
  } catch (error) {
    console.error("Admin login failed:", error.message);
    return res.status(500).json({
      success: false,
      message: "Could not log in.",
    });
  }
});

module.exports = router;
