const express = require("express");
const router = express.Router();
const db = require("../db");

// Get Dashboard Statistics
router.get("/", async (req, res) => {
    try {
        const [totalBooks] = await db.promise().query("SELECT COUNT(*) AS total FROM books");
        const [totalMembers] = await db.promise().query("SELECT COUNT(*) AS total FROM members");
        const [borrowedBooks] = await db.promise().query("SELECT COUNT(*) AS total FROM borrowed_books WHERE return_date IS NULL");
        const [overdueBooks] = await db.promise().query("SELECT COUNT(*) AS total FROM borrowed_books WHERE due_date < CURDATE() AND return_date IS NULL");

        res.json({
            totalBooks: totalBooks[0].total,
            totalMembers: totalMembers[0].total,
            borrowedBooks: borrowedBooks[0].total,
            overdueBooks: overdueBooks[0].total
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
