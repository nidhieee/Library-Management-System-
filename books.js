document.addEventListener("DOMContentLoaded", () => {
    const booksTableBody = document.getElementById("booksTableBody");
    const bookModal = document.getElementById("bookModal");
    const addBookBtn = document.getElementById("addBookBtn");
    const closeModal = document.querySelector(".close");
    const bookForm = document.getElementById("bookForm");
    const searchInput = document.getElementById("searchBook");
    const searchBtn = document.getElementById("searchBtn");
    const darkModeToggle = document.getElementById("darkModeToggle");
    const body = document.body;

    // Fetch books from backend and render
    async function fetchBooks() {
        try {
            const response = await fetch("http://localhost:3000/api/books");
            if (!response.ok) throw new Error("Failed to fetch books");
            const books = await response.json();
            renderBooks(books);
        } catch (error) {
            console.error("Error fetching books:", error);
        }
    }

    // Render books in the table
    function renderBooks(books) {
        booksTableBody.innerHTML = books.map(book => `
            <tr>
                <td>${book.book_id}</td>
                <td>${book.title}</td>
                <td>${book.author}</td>
                <td>${book.published_year || "N/A"}</td>
                <td>${book.genre}</td>
                <td>${book.available_copies > 0 ? "Available" : "Unavailable"}</td>
                <td>
                    <button onclick="editBook(${book.book_id})">✏️ Edit</button>
                    <button onclick="deleteBook(${book.book_id})">🗑️ Delete</button>
                </td>
            </tr>
        `).join("");
    }
    // Open modal for adding a new book
    addBookBtn.addEventListener("click", () => {
        bookForm.reset();
        document.getElementById("bookId").value = ""; // Clear ID for new books
        bookModal.style.display = "flex";
    });

    // Close the modal
    closeModal.addEventListener("click", () => {
        bookModal.style.display = "none";
    });

    // Handle form submission
    bookForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const bookId = document.getElementById("bookId").value.trim();
        const book = {
            title: document.getElementById("bookName").value.trim(),
            author: document.getElementById("bookAuthor").value.trim(),
            published_year: parseInt(document.getElementById("bookYear").value.trim()) || null,
            genre: document.getElementById("bookGenre").value.trim(),
            total_copies: parseInt(document.getElementById("totalCopies").value),
            available_copies: parseInt(document.getElementById("availableCopies").value)
        };

        if (!book.title || !book.author || !book.genre || isNaN(book.total_copies) || isNaN(book.available_copies)) {
            alert("❌ Please fill all fields!");
            return;
        }

        if (book.available_copies > book.total_copies) {
            alert("❌ Available copies cannot exceed total copies!");
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/api/books${bookId ? `/${bookId}` : ""}`, {
                method: bookId ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(book),
            });

            const result = await response.json();
            alert(result.message);
            if (response.ok) {
                bookModal.style.display = "none";
                fetchBooks();
            }
        } catch (error) {
            console.error("Error saving book:", error);
            alert("❌ Failed to save book");
        }
    });
    

    // Edit book function
    window.editBook = async (bookId) => {
        try {
            const response = await fetch(`http://localhost:3000/api/books/${bookId}`);
            const book = await response.json();
    
            if (!book) {
                alert("Book not found!");
                return;
            }
    
            document.getElementById("bookId").value = book.book_id;
            document.getElementById("bookName").value = book.title;
            document.getElementById("bookAuthor").value = book.author;
            document.getElementById("bookYear").value = book.published_year;
            document.getElementById("bookGenre").value = book.genre;
            document.getElementById("totalCopies").value = book.total_copies;
            document.getElementById("availableCopies").value = book.available_copies;
    
            bookModal.style.display = "flex";
        } catch (error) {
            console.error("Error fetching book details:", error);
        }
    };
    

    // Delete book function
    window.deleteBook = async (bookId) => {
        if (!confirm("Are you sure you want to delete this book?")) return;
    
        try {
            const response = await fetch(`http://localhost:3000/api/books/${bookId}`, { method: "DELETE" });
            const result = await response.json();
            alert(result.message);
            if (response.ok) fetchBooks();
        } catch (error) {
            console.error("Error deleting book:", error);
            alert("❌ Failed to delete book");
        }
    };
    

    // Search function
    function filterBooks() {
        const searchValue = searchInput.value.trim().toLowerCase();
        const rows = booksTableBody.getElementsByTagName("tr");

        for (let row of rows) {
            const bookId = row.cells[0]?.textContent.toLowerCase();
            const bookTitle = row.cells[1]?.textContent.toLowerCase();

            if (bookId.includes(searchValue) || bookTitle.includes(searchValue)) {
                row.style.display = "";
            } else {
                row.style.display = "none";
            }
        }
    }

    // Attach event listeners for searching
    searchBtn.addEventListener("click", filterBooks);
    searchInput.addEventListener("keyup", (event) => {
        if (event.key === "Enter") filterBooks();
    });

    // Load genres into dropdown
    function loadGenres() {
        const genres = ["Fiction", "Science & Technology", "History", "Fantasy", "Romance", "Horror", "Classic", "Mystery & Thriller", "Self-Help", "Biography & Memoir"];
        const genreDropdown = document.getElementById("bookGenre");

        genreDropdown.innerHTML = '<option value="">Select Genre</option>'; // Reset options
        genres.forEach(genre => {
            const option = document.createElement("option");
            option.value = genre;
            option.textContent = genre;
            genreDropdown.appendChild(option);
        });
    }


    // Dark mode toggle
    if (localStorage.getItem("darkMode") === "enabled") {
        body.classList.add("dark-mode");
        darkModeToggle.checked = true;
    }

    darkModeToggle.addEventListener("change", () => {
        if (darkModeToggle.checked) {
            body.classList.add("dark-mode");
            localStorage.setItem("darkMode", "enabled");
        } else {
            body.classList.remove("dark-mode");
            localStorage.setItem("darkMode", "disabled");
        }
    });

    // Initialize everything
    fetchBooks();
    loadGenres();
});
