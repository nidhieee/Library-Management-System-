document.addEventListener("DOMContentLoaded", function () {
    fetchTrendingBooks(); // Fetch books when the page loads
    fetchDashboardStats();

    const genreFilter = document.getElementById("genreFilter");
    const body = document.body;
    const toggle = document.getElementById("darkModeToggle");

    if (!toggle) {
        console.error("Dark mode toggle not found!");
        return;
    }

    // Load dark mode state from localStorage
    if (localStorage.getItem("darkMode") === "enabled") {
        body.classList.add("dark-mode");
        toggle.checked = true;
    }

    // Toggle dark mode when switch is clicked
    toggle.addEventListener("change", () => {
        if (toggle.checked) {
            body.classList.add("dark-mode");
            localStorage.setItem("darkMode", "enabled");
        } else {
            body.classList.remove("dark-mode");
            localStorage.setItem("darkMode", "disabled");
        }
    });

    // Genre filtering
    if (genreFilter) {
        genreFilter.addEventListener("change", function () {
            fetchTrendingBooks(this.value);
        });
    }
});

// Welcome Message
const welcomeMessage = document.getElementById("welcomeMessage");

if (welcomeMessage) {
    let username = localStorage.getItem("username");
    if (username) {
        // ✅ Capitalize first letter for better formatting
        username = username.charAt(0).toUpperCase() + username.slice(1);
        welcomeMessage.innerText = `Welcome, ${username}!`;
    } else {
        console.warn("Username not found in localStorage!");
    }
}


// Trending Books
const trendingList = document.getElementById("trendingBooksList");

function fetchTrendingBooks(genre = "all") {
    let url = "http://localhost:3000/api/trending";
    if (genre && genre !== "all") {
        url += `?genre=${encodeURIComponent(genre)}`;
    }

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (!Array.isArray(data)) {
                throw new Error("Invalid response format");
            }

            if (!trendingList) return;
            trendingList.innerHTML = ""; // Clear previous results

            if (data.length === 0) {
                trendingList.innerHTML = "<p>No books found.</p>";
                return;
            }

            // ✅ Directly display only the top 5 books
            data.slice(0, 5).forEach((book, index) => {
                const bookItem = document.createElement("li");
                bookItem.classList.add("book-item");

                if (index === 0) {
                    bookItem.classList.add("top-trending");
                }

                bookItem.innerHTML = `
                    <span class="book-title">${book.title}</span>
                    <span class="book-author">by ${book.author}</span>
                `;
                trendingList.appendChild(bookItem);
            });
        })
        .catch(error => {
            console.error("Error fetching trending books:", error);
            trendingList.innerHTML = `<p class="error-message">Error loading books.</p>`;
        });
}

// Check if the genre filter exists before adding an event listener
const genreFilter = document.getElementById("genreFilter");
if (genreFilter) {
    genreFilter.addEventListener("change", () => {
        fetchTrendingBooks(genreFilter.value);
    });
}

function fetchDashboardStats() {
    fetch("http://localhost:3000/api/dashboard")
        .then(response => response.json())
        .then(data => {
            console.log("Dashboard Data:", data); // Debugging

            if (data.error) {
                console.error("Error from API:", data.error);
                return;
            }

            if (document.getElementById("totalBooks")) {
                document.getElementById("totalBooks").innerText = data.totalBooks ?? 0;
            }
            if (document.getElementById("totalMembers")) {
                document.getElementById("totalMembers").innerText = data.totalMembers ?? 0;
            }
            if (document.getElementById("borrowedBooks")) {
                document.getElementById("borrowedBooks").innerText = data.borrowedBooks ?? 0;
            }
            if (document.getElementById("overdueBooks")) {
                document.getElementById("overdueBooks").innerText = data.overdueBooks ?? 0;
            }
        })
        .catch(error => {
            console.error("Error fetching dashboard stats:", error);
        });
}

// Load dashboard stats & trending books initially
document.addEventListener("DOMContentLoaded", () => {
    fetchDashboardStats();
    fetchTrendingBooks();
});