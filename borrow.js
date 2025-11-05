document.addEventListener("DOMContentLoaded", () => {
    fetchBorrowedBooks();

    document.getElementById("searchInput").addEventListener("input", function () {
        fetchBorrowedBooks(this.value.trim());
    });

    document.getElementById("addEntryBtn").addEventListener("click", () => {
        document.getElementById("borrowForm").reset();
        document.getElementById("borrowModal").style.display = "block";
    });

    document.getElementById("borrowForm").addEventListener("submit", async (e) => {
        e.preventDefault();  // Prevent default form submission

        const memberId = document.getElementById("memberId").value.trim();
        const bookId = document.getElementById("bookId").value.trim();
        const borrowDate = document.getElementById("borrowDate").value;
        const dueDate = document.getElementById("dueDate").value;

        try {
            const response = await fetch("http://localhost:3000/api/borrow/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    member_id: memberId, 
                    book_id: bookId, 
                    borrow_date: borrowDate, 
                    due_date: dueDate 
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert("Book borrowed successfully!");
                fetchBorrowedBooks(); // Refresh list
                document.getElementById("borrowModal").style.display = "none"; // Hide modal
            } else {
                alert(data.message || "Book is not available!");
            }
        } catch (error) {
            console.error("Error adding borrow record:", error);
            alert("An error occurred. Please try again.");
        }
    });
});

// Fetch Borrowed Books (Show returned books at bottom)
function fetchBorrowedBooks(query = "") {
    let url = "http://localhost:3000/api/borrow";
    if (query) url += `?search=${query}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log("Fetched data:", data);  // ✅ Check if data is received
            const tableBody = document.getElementById("borrowTableBody");

            if (!tableBody) {
                console.error("❌ Table body not found in DOM!");
                return;
            }

            tableBody.innerHTML = "";

            if (data.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="8">No records found.</td></tr>`;
                return;
            }

            const activeBooks = data.filter(b => !b.return_date);
            const returnedBooks = data.filter(b => b.return_date);

            activeBooks.forEach(borrow => createRow(borrow, false));
            returnedBooks.forEach(borrow => createRow(borrow, true));

            document.querySelectorAll(".return-btn").forEach(button => {
                button.addEventListener("click", returnBook);
            });
        })
        .catch(error => console.error("Error fetching borrowed books:", error));
}

// ✅ Helper function to format date correctly (Handles timezone issues)
function formatDate(dateString) {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB"); // ✅ Format as DD/MM/YYYY
}

// Return Book Function
async function returnBook(event) {
    const borrowId = event.target.dataset.id;
    if (!confirm("Are you sure you want to return this book?")) return;

    try {
        const response = await fetch(`http://localhost:3000/api/borrow/return/${borrowId}`, {
            method: "PUT"
        });

        if (response.ok) {
            console.log(`🟢 Book returned successfully for borrow_id: ${borrowId}`);
            fetchBorrowedBooks(); // ✅ Refresh table after return
        } else {
            console.error("❌ Failed to return book.");
        }
    } catch (error) {
        console.error("❌ Error:", error);
    }
}


// Show Add Entry Modal
document.getElementById("addEntryBtn").addEventListener("click", () => {
    document.getElementById("borrowForm").reset();
    document.getElementById("borrowModal").style.display = "block";
});

// Close modal when clicking the close button
document.querySelector("#borrowModal .close").addEventListener("click", () => {
    document.getElementById("borrowModal").style.display = "none";
});

function createRow(borrow, isReturned) {
    const tableBody = document.getElementById("borrowTableBody");

    const row = document.createElement("tr");
    row.innerHTML = `
       
        <td>${borrow.book_id}</td>
        <td>${borrow.member_id}</td>
        <td>${borrow.book_name}</td>
        <td>${formatDate(borrow.borrow_date)}</td>
        <td>${formatDate(borrow.due_date)}</td>
        <td>${borrow.return_date ? formatDate(borrow.return_date) : "-"}</td>
        <td>${borrow.fine_amount ? `₹${borrow.fine_amount}` : "₹0"}</td>
        <td>
            ${!isReturned ? `<button class="return-btn" data-id="${borrow.borrow_id}">Return</button>` : ""}
        </td>
    `;

    tableBody.appendChild(row);
}

// Dark Mode Toggle
const darkModeToggle = document.getElementById("darkModeToggle");
if (localStorage.getItem("darkMode") === "enabled") {
    document.body.classList.add("dark-mode");
    darkModeToggle.checked = true;
}

darkModeToggle.addEventListener("change", () => {
    document.body.classList.toggle("dark-mode", darkModeToggle.checked);
    localStorage.setItem("darkMode", darkModeToggle.checked ? "enabled" : "disabled");
});
