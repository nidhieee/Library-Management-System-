const express = require("express");
const router = express.Router();
const db = require("../db"); // Database connection
const jwt = require("jsonwebtoken");
require("dotenv").config();

// ===================== 🟢 LOGIN ROUTE ===================== //
router.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    // Check if user exists
    const sql = "SELECT * FROM users WHERE username = ?";
    db.query(sql, [username], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        if (results.length === 0) {
            return res.status(401).json({ message: "Invalid credentials." });
        }

        const user = results[0];

        // Compare passwords directly (NO HASHING)
        if (password !== user.password) {
            return res.status(401).json({ message: "Invalid credentials." });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user.user_id, username: user.username }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });

        console.log("✅ Sending response:", { message: "Login successful", token, username: user.username }); // ✅ Debug
        res.json({ message: "Login successful", token, username: user.username });
    });
});

module.exports = router;
