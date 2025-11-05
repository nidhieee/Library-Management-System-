const express = require("express");
const router = express.Router();
const db = require("../db"); // Import database connection

// ===================== 🟢 FETCH FINES (With Correct Calculation) ===================== //
router.get("/", (req, res) => {
    const query = `
        SELECT m.name, m.member_id, b.title, bb.due_date, fines.fine_amount, bb.book_id
FROM members m
JOIN borrowed_books bb ON m.member_id = bb.member_id
JOIN books b ON bb.book_id = b.book_id
JOIN fines ON bb.member_id = fines.member_id AND bb.book_id = fines.book_id;
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("❌ Error fetching data:", err);
            return res.status(500).json({ error: "Database error" });
        }

        res.json(results);
    });
});


// ===================== 🟢 RETURN BOOK (REMOVE FINE ENTRY) ===================== //
router.delete("/:memberId/:bookId", (req, res) => {
    const { memberId, bookId } = req.params;

    const updateQuery = "UPDATE borrowed_books SET return_date = NOW() WHERE member_id = ? AND book_id = ?";
    const deleteFineQuery = "DELETE FROM fines WHERE member_id = ? AND book_id = ?";

    db.query(updateQuery, [memberId, bookId], (err, result) => {
        if (err) return res.status(500).json({ error: "Failed to update return date" });

        db.query(deleteFineQuery, [memberId, bookId], (err, result) => {
            if (err) return res.status(500).json({ error: "Failed to delete fine record" });
            res.json({ message: "✅ Book returned & fine removed!" });
        });
    });
});
module.exports = router;
