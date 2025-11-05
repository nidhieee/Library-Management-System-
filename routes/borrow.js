const express = require("express");
const router = express.Router();
const db = require("../db");

// Get Borrowed Books with Fine Calculation
router.get("/", (req, res) => {
    let query = `
        SELECT 
            b.borrow_id, 
            b.book_id, 
            m.member_id, 
            books.title AS book_name, 
            b.borrow_date, 
            b.due_date, 
            b.return_date,
            COALESCE(f.fine_amount, 0) AS fine_amount
        FROM borrowed_books b
        JOIN books ON b.book_id = books.book_id
        JOIN members m ON b.member_id = m.member_id
        LEFT JOIN fines f ON b.member_id = f.member_id AND b.book_id = f.book_id
        WHERE (b.return_date IS NULL OR b.return_date > b.due_date); 
    `;

    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

router.post("/add", (req, res) => {
    const { member_id, book_id, borrow_date, due_date } = req.body;

    if (!member_id || !book_id || !borrow_date || !due_date) {
        return res.status(400).json({ message: "Missing required fields!" });
    }

    // Step 1: Check if book is available
    const checkAvailabilitySQL = `SELECT available_copies FROM books WHERE book_id = ?`;

    db.query(checkAvailabilitySQL, [book_id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: "Book not found!" });

        const availableCopies = results[0].available_copies;

        if (availableCopies <= 0) {
            return res.status(400).json({ message: "Book not available!" });
        }

        // Step 2: Insert borrow entry
        const borrowSQL = `INSERT INTO borrowed_books (member_id, book_id, borrow_date, due_date) VALUES (?, ?, ?, ?)`;

        db.query(borrowSQL, [member_id, book_id, borrow_date, due_date], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });

            // Step 3: Decrease available copies
            const updateCopiesSQL = `UPDATE books SET available_copies = available_copies - 1 WHERE book_id = ?`;

            db.query(updateCopiesSQL, [book_id], (updateErr) => {
                if (updateErr) return res.status(500).json({ error: updateErr.message });

                // Step 4: Calculate fine if overdue
                const today = new Date().toISOString().split("T")[0];

                let fineAmount = 0;
                if (new Date(today) > new Date(due_date)) {
                    const overdueDays = Math.floor((new Date(today) - new Date(due_date)) / (1000 * 60 * 60 * 24));
                    fineAmount = Math.floor(overdueDays / 7) * 100; // ₹100 per week
                }

                // Step 5: Insert fine entry (or update if already exists)
                const fineSQL = `INSERT INTO fines (member_id, book_id, fine_amount) VALUES (?, ?, ?) 
                                 ON DUPLICATE KEY UPDATE fine_amount = ?`;

                db.query(fineSQL, [member_id, book_id, fineAmount, fineAmount], (fineErr) => {
                    if (fineErr) return res.status(500).json({ error: fineErr.message });

                    res.json({ message: "Book borrowed successfully!" });
                });
            });
        });
    });
});



// Return Book (Updates Borrowed Books & Removes Fine)
router.put("/return/:borrow_id", (req, res) => {
    const { borrow_id } = req.params;
    const returnDate = new Date().toISOString().split("T")[0]; // Current date

    // Get book and member details
    const getBookDetails = `SELECT book_id, member_id FROM borrowed_books WHERE borrow_id = ?`;
    
    db.query(getBookDetails, [borrow_id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length === 0) return res.status(404).json({ message: "Borrow record not found" });

        const { book_id, member_id } = result[0];

        // Update Borrowed Books table
        const updateBorrowSQL = `UPDATE borrowed_books SET return_date = ? WHERE borrow_id = ?`;
        db.query(updateBorrowSQL, [returnDate, borrow_id], (borrowErr) => {
            if (borrowErr) return res.status(500).json({ error: borrowErr.message });

            // Update Available Copies in Books Table
            const updateBookCountSQL = `UPDATE books SET available_copies = available_copies + 1 WHERE book_id = ?`;
            db.query(updateBookCountSQL, [book_id], (bookErr) => {
                if (bookErr) return res.status(500).json({ error: bookErr.message });

                // Remove fine entry if book is returned
                const deleteFineSQL = `DELETE FROM fines WHERE member_id = ? AND book_id = ?`;
                db.query(deleteFineSQL, [member_id, book_id], (fineErr) => {
                    if (fineErr) return res.status(500).json({ error: fineErr.message });

                    res.json({ message: "Book returned successfully!" });
                });
            });
        });
    });
});

// Function to Calculate and Insert Fines
function calculateAndInsertFines() {
    const today = new Date().toISOString().split("T")[0];

    const getOverdueBooks = `
        SELECT b.member_id, b.book_id, b.due_date
        FROM borrowed_books b
        LEFT JOIN fines f ON b.member_id = f.member_id AND b.book_id = f.book_id
        WHERE b.return_date IS NULL AND b.due_date < ? AND f.fine_amount IS NULL;
    `;

    db.query(getOverdueBooks, [today], (err, results) => {
        if (err) {
            console.error("Error fetching overdue books:", err);
            return;
        }

        results.forEach(book => {
            const { member_id, book_id, due_date } = book;
            const overdueDays = Math.floor((new Date(today) - new Date(due_date)) / (1000 * 60 * 60 * 24));
            const overdueWeeks = Math.ceil(overdueDays / 7);
            const fineAmount = overdueWeeks * 100; // Rs 100 per week

            // Insert fine record
            const insertFineSQL = `INSERT INTO fines (member_id, book_id, fine_amount) VALUES (?, ?, ?)`;
            db.query(insertFineSQL, [member_id, book_id, fineAmount], (fineErr) => {
                if (fineErr) {
                    console.error("Error inserting fine:", fineErr);
                } else {
                    console.log(`Fine inserted for member ${member_id}, book ${book_id}`);
                }
            });
        });
    });
}

// Run fine calculation every 24 hours
setInterval(calculateAndInsertFines, 24 * 60 * 60 * 1000);

module.exports = router;
7