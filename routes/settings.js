const express = require("express");
const router = express.Router();
const db = require("../db"); // Ensure this is your database connection

// Get user details by username (with session/token support)
router.get("/user", (req, res) => {
    const username = req.query.username; // Expect username in query param
    console.log("Fetching user details for:", username); // Debugging

    if (!username) {
        console.error("Error: Username is missing in request.");
        return res.status(400).json({ success: false, message: "Username is required" });
    }

    const query = "SELECT username, email FROM users WHERE username = ?";
    db.query(query, [username], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ success: false, message: "Database error", error: err });
        }
        if (results.length === 0) {
            console.warn("User not found:", username);
            return res.status(404).json({ success: false, message: "User not found" });
        }

        console.log("User found:", results[0]); // Debugging
        res.json({ success: true, user: results[0] });
    });
});

// Update email
router.put("/update-email", (req, res) => {
    const { username, newEmail } = req.body;
    if (!username || !newEmail) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Check if email already exists
    const checkEmailQuery = "SELECT email FROM users WHERE email = ?";
    db.query(checkEmailQuery, [newEmail], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Database error", error: err });
        }
        if (results.length > 0) {
            return res.status(409).json({ success: false, message: "Email already in use" });
        }

        // Update email if it's unique
        const updateQuery = "UPDATE users SET email = ? WHERE username = ?";
        db.query(updateQuery, [newEmail, username], (err, result) => {
            if (err) {
                return res.status(500).json({ success: false, message: "Database error", error: err });
            }
            res.json({ success: true, message: "Email updated successfully" });
        });
    });
});

// Update password
router.put("/update-password", (req, res) => {
    const { username, currentPassword, newPassword } = req.body;
    if (!username || !currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Fetch user's current password
    const getPasswordQuery = "SELECT password FROM users WHERE username = ?";
    db.query(getPasswordQuery, [username], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ success: false, message: "Database error", error: err });
        }
        if (results.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const storedPassword = results[0].password;

        // Compare current password (No hashing, just direct comparison)
        if (currentPassword !== storedPassword) {
            return res.status(401).json({ success: false, message: "Current password is incorrect" });
        }

        // Update password directly (Not hashed)
        const updateQuery = "UPDATE users SET password = ? WHERE username = ?";
        db.query(updateQuery, [newPassword, username], (err, result) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ success: false, message: "Database error", error: err });
            }
            res.json({ success: true, message: "Password updated successfully" });
        });
    });
});

module.exports = router;
