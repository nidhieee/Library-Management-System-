const express = require("express");
const router = express.Router();
const db = require("../db"); // Database connection

// Fetch all books
router.get("/", (req, res) => {
    db.query("SELECT * FROM books", (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

// Add a new book 
router.post("/", (req, res) => {
    const { title, author, published_year, genre, total_copies } = req.body;

    // Validate inputs
    if (!title || !author || !published_year || !genre || !total_copies) {
        return res.status(400).json({ error: "All fields are required!" });
    }

    const year = parseInt(published_year);
    const copies = parseInt(total_copies);

    // Ensure valid numbers
    if (Number.isNaN(year) || Number.isNaN(copies)) {
        return res.status(400).json({ error: "Invalid data format!" });
    }

    const sql = `
        INSERT INTO books (title, author, published_year, genre, total_copies, available_copies)
        VALUES (?, ?, ?, ?, ?, ?)`;
        
    db.query(sql, [title, author, year, genre, copies, copies], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "✅ Book added successfully", bookId: result.insertId });
    });
});



// Get a single book
router.get("/:id", (req, res) => {
    db.query("SELECT * FROM books WHERE book_id = ?", [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length === 0) return res.status(404).json({ error: "Book not found" });
        res.json(result[0]);
    });
});

// Update a book
router.put("/:id", (req, res) => {
    const { title, author, published_year, genre, available_copies } = req.body;

    // Validate inputs
    if (!title || !author || !published_year || !genre || available_copies === undefined) {
        return res.status(400).json({ error: "All fields are required!" });
    }

    const year = parseInt(published_year);
    const available = parseInt(available_copies);

    if (Number.isNaN(year) || Number.isNaN(available)) {
        return res.status(400).json({ error: "Invalid data format!" });
    }

    const sql = `
        UPDATE books 
        SET title = ?, author = ?, published_year = ?, genre = ?, available_copies = ?
        WHERE book_id = ?`;

    db.query(sql, [title, author, year, genre, available, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "✅ Book updated successfully" });
    });
});



// Delete a book
router.delete("/:id", (req, res) => {
    db.query("DELETE FROM books WHERE book_id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "✅ Book deleted successfully" });
    });
});

module.exports = router;
