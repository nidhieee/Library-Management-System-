document.addEventListener("DOMContentLoaded", () => {
    if (!window.finesLoaded) {  // ✅ Prevent duplicate calls
        window.finesLoaded = true;
        loadFineData();
    }

    const body = document.body;
    const darkModeToggle = document.getElementById("darkModeToggle");
    const searchInput = document.getElementById("searchInput");

    if (darkModeToggle) {
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
    }

    if (searchInput) {
        searchInput.addEventListener("input", function () {
            const searchValue = this.value.toLowerCase();
            const rows = document.querySelectorAll("#fineTableBody tr");

            rows.forEach(row => {
                const memberName = row.cells[0]?.textContent.toLowerCase() || "";
                const memberId = row.cells[1]?.textContent.toLowerCase() || "";
                const bookTitle = row.cells[2]?.textContent.toLowerCase() || "";

                row.style.display = (memberName.includes(searchValue) || memberId.includes(searchValue) || bookTitle.includes(searchValue)) ? "" : "none";
            });
        });
    }
});

// ✅ Fetch Fine Data & Display
async function loadFineData() {
    const fineTableBody = document.getElementById("fineTableBody");
    fineTableBody.innerHTML = "";

    try {
        const response = await fetch("http://localhost:3000/api/fine");
        if (!response.ok) throw new Error(`Failed to fetch fines: ${response.status}`);

        const fines = await response.json();
        if (fines.length === 0) {
            fineTableBody.innerHTML = "<tr><td colspan='6'>No fines available</td></tr>";
            return;
        }

        fines.forEach(fine => {
            let fineAmount = parseFloat(fine.fine_amount) || 0;

            let row = document.createElement("tr");
            row.innerHTML = `
                <td>${fine.name || "-"}</td>
                <td>${fine.member_id || "-"}</td>
                <td>${fine.title || "Unknown"}</td>
                <td>${formatDate(fine.due_date)}</td>
                <td>₹${fineAmount.toFixed(2)}</td>
                <td>
                    ${fineAmount > 0 ? `<button class="pay-btn" data-member-id="${fine.member_id}" data-book-id="${fine.book_id}">Pay Fine</button>` : "No Fine"}
                </td>
            `;

            fineTableBody.appendChild(row);
        });

        // ✅ Attach event listener to Pay buttons
        document.querySelectorAll(".pay-btn").forEach(button => {
            button.addEventListener("click", function () {
                const memberId = this.dataset.memberId;
                const bookId = this.dataset.bookId;
                markAsPaid(memberId, bookId);
            });
        });

    } catch (error) {
        console.error("❌ Error loading fine data:", error);
    }
}

// ✅ Pay Fine & Remove Entry
async function markAsPaid(memberId, bookId) {
    if (!confirm(`Are you sure you want to pay the fine for Member ${memberId}?`)) return;

    try {
        const response = await fetch(`http://localhost:3000/api/fine/${memberId}/${bookId}`, {
            method: "DELETE"
        });

        if (response.ok) {
            console.log(`🟢 Fine paid for Member ${memberId}, Book ${bookId}`);
            loadFineData(); // ✅ Refresh the table
        } else {
            console.error("❌ Failed to mark as paid");
        }
    } catch (error) {
        console.error("❌ Error:", error);
    }
}

// ✅ Format Date Function
function formatDate(dateString) {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB");
}
