const express = require("express");
const router = express.Router();
const db = require("../db"); // Database connection


// Fetch all members with fine amounts and membership start date
router.get("/", (req, res) => {
    const query = `
        SELECT 
    m.member_id, m.name, m.email, m.membership_type, m.membership_start,
    COALESCE(SUM(f.fine_amount), 0) AS total_fine
FROM members m
LEFT JOIN fines f ON m.member_id = f.member_id AND f.paid = 0 -- Consider only unpaid fines
GROUP BY m.member_id, m.name, m.email, m.membership_type, m.membership_start;
    `;

    db.query(query, (err, result) => {
        if (err) {
            console.error("❌ Database Query Error:", err);
            return res.status(500).json({ error: err.message });
        }
        res.json(result);
    });
});

// Add a new member
router.post("/", (req, res) => {
    const { name, email, membership_type, membership_start } = req.body;
    if (!name || !email || !membership_type || !membership_start) {
        return res.status(400).json({ error: "All fields are required!" });
    }

    const sql = `INSERT INTO members (name, email, membership_type, membership_start) VALUES (?, ?, ?, ?)`;
    db.query(sql, [name, email, membership_type, membership_start], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "✅ Member added successfully", memberId: result.insertId });
    });
});

// Search members by name OR member_id

router.get("/search", (req, res) => {
    const searchQuery = `%${req.query.query.toLowerCase().trim()}%`;

    const sql = `
        SELECT * FROM members 
        WHERE LOWER(name) LIKE ? OR member_id LIKE ?;
    `;

    db.query(sql, [searchQuery, searchQuery], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

// 🔹 GET single member (must be after "/search" to prevent conflicts)
router.get("/:id", (req, res) => {
    const sql = `SELECT * FROM members WHERE member_id = ?`;

    db.query(sql, [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length === 0) return res.status(404).json({ error: "Member not found" });
        res.json(result[0]);
    });
});

// Get a single member by ID (needed for editing)
router.get("/:id", (req, res) => {
    const sql = `SELECT * FROM members WHERE member_id = ?`;
    
    db.query(sql, [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length === 0) return res.status(404).json({ error: "Member not found" });
        res.json(result[0]);
    });
});

// Update a member
router.put("/:id", (req, res) => {
    const { name, email, membership_type } = req.body;
    if (!name || !email || !membership_type) {
        return res.status(400).json({ error: "All fields are required!" });
    }

    const sql = `UPDATE members SET name = ?, email = ?, membership_type = ? WHERE member_id = ?`;
    db.query(sql, [name, email, membership_type, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "✅ Member updated successfully" });
    });
});


// Delete a member
router.delete("/:id", (req, res) => {
    db.query("DELETE FROM members WHERE member_id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "✅ Member deleted successfully" });
    });
});
module.exports = router;
