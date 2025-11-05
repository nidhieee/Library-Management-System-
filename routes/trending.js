const express = require("express");
const router = express.Router();
const db = require("../db");

// ===================== 🟢 GET TRENDING BOOKS ===================== //

router.get("/", (req, res) => {
    const genreFilter = req.query.genre;

    let sqlQuery;
    let queryParams = [];

    if (genreFilter && genreFilter !== "all") {
        // Fetch top 5 books of a specific genre
        sqlQuery = `
            SELECT books.book_id, books.title, books.author, books.genre,
                   COUNT(borrowed_books.book_id) AS borrowed_count
            FROM books
            LEFT JOIN borrowed_books ON books.book_id = borrowed_books.book_id
            WHERE books.genre = ?
            GROUP BY books.book_id
            ORDER BY borrowed_count DESC
            LIMIT 5;
        `;
        queryParams.push(genreFilter);
    } else {
        // ✅ Fetch ONLY the top 5 most borrowed books overall
        sqlQuery = `
            SELECT books.book_id, books.title, books.author, books.genre,
                   COUNT(borrowed_books.book_id) AS borrowed_count
            FROM books
            LEFT JOIN borrowed_books ON books.book_id = borrowed_books.book_id
            GROUP BY books.book_id
            ORDER BY borrowed_count DESC
            LIMIT 5;  -- 🔥 This ensures only 5 books are returned
        `;
    }

    db.query(sqlQuery, queryParams, (err, results) => {
        if (err) {
            console.error("❌ Error fetching trending books:", err);
            return res.status(500).json({ error: "Database error", details: err.message });
        }

        if (!Array.isArray(results)) {
            console.error("❌ Unexpected response format:", results);
            return res.status(500).json({ error: "Invalid data format" });
        }

        res.json(results);
    });
});

module.exports = router;
