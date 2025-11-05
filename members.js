document.addEventListener("DOMContentLoaded", async () => {
    const membersTableBody = document.getElementById("membersTableBody");
    const memberModal = document.getElementById("memberModal");
    const addMemberBtn = document.getElementById("addMemberBtn");
    const closeModal = document.querySelector(".close");
    const memberForm = document.getElementById("memberForm");

    // Fetch members from the backend
    async function fetchMembers() {
        try {
            const response = await fetch("http://localhost:3000/api/members");
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const members = await response.json();
            renderMembers(members);
        } catch (error) {
            console.error("Error fetching members:", error);
        }
    }

    // Render members in the table
    function renderMembers(members) {
        membersTableBody.innerHTML = "";
        members.forEach((member) => {
            const fineDisplay = member.total_fine > 0 ? `₹${member.total_fine}` : "No Fine";

            const row = `<tr>
                <td>${member.member_id}</td>
                <td>${member.name}</td>
                <td>${member.email}</td>
                <td>${member.membership_type}</td>
                <td>${new Date(member.membership_start).toLocaleDateString()}</td>
                <td>${fineDisplay}</td>
                <td>
                    <button class="edit-btn" data-id="${member.member_id}">✏️ Edit</button>
                    <button class="delete-btn" data-id="${member.member_id}">🗑️ Delete</button>
                </td>
            </tr>`;
            membersTableBody.innerHTML += row;
        });
    }

    // Open Add Member Modal
    addMemberBtn.addEventListener("click", () => {
        memberForm.reset();
        document.getElementById("memberId").value = "";
        memberModal.style.display = "flex";
    });

    // Close Modal
    closeModal.addEventListener("click", () => {
        memberModal.style.display = "none";
    });

// Handle Form Submission (Add/Edit Member)
memberForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const memberId = document.getElementById("memberId").value;
    const member = {
        name: document.getElementById("memberName").value.trim(),
        email: document.getElementById("email").value.trim(),
        membership_type: document.getElementById("membershipType").value,
        membership_start: document.getElementById("membershipStart").value,
    };

    try {
        const url = memberId ? `http://localhost:3000/api/members/${memberId}` : "http://localhost:3000/api/members";
        const method = memberId ? "PUT" : "POST";

        const response = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(member),
        });

        if (!response.ok) throw new Error(`Failed to save member: ${response.statusText}`);

        fetchMembers();
        memberModal.style.display = "none";
    } catch (error) {
        console.error("Error saving member:", error);
    }
});

    
    // Handle Edit & Delete Actions
    membersTableBody.addEventListener("click", async (event) => {
        const memberId = event.target.dataset.id;

        if (event.target.classList.contains("edit-btn")) {
            try {
                const response = await fetch(`http://localhost:3000/api/members/${memberId}`);
                if (!response.ok) throw new Error("Failed to fetch member data");

                const member = await response.json();

                document.getElementById("memberId").value = member.member_id;
                document.getElementById("memberName").value = member.name;
                document.getElementById("email").value = member.email;
                document.getElementById("membershipType").value = member.membership_type;
                document.getElementById("membershipStart").value = member.membership_start.split("T")[0];

                document.getElementById("modalTitle").textContent = "Edit Member";
                memberModal.style.display = "flex";
            } catch (error) {
                console.error("Error fetching member data:", error);
            }
        }

        if (event.target.classList.contains("delete-btn")) {
            if (confirm("Delete this member?")) {
                try {
                    await fetch(`http://localhost:3000/api/members/${memberId}`, { method: "DELETE" });
                    fetchMembers();
                } catch (error) {
                    console.error("Error deleting member:", error);
                }
            }
        }
    });

    // Fetch members on page load
    fetchMembers();
});

// Search as user types
document.getElementById("searchMember").addEventListener("input", async function () {
    const searchValue = this.value.trim().toLowerCase();

    if (searchValue === "") {
        fetchMembers(); // Reload full member list when input is empty
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/members/search?query=${encodeURIComponent(searchValue)}`);
        if (!response.ok) throw new Error("Failed to search members");

        const members = await response.json();
        renderMembers(members);
    } catch (error) {
        console.error("Error searching members:", error);
    }
});

function renderMembers(members) {
    const membersTableBody = document.querySelector("#membersTableBody"); // ✅ Corrected ID

    if (!membersTableBody) {
        console.error("❌ Error: #membersTableBody not found. Check your HTML.");
        return;
    }

    membersTableBody.innerHTML = ""; // Clear table before rendering new results

    if (members.length === 0) {
        membersTableBody.innerHTML = "<tr><td colspan='7'>No members found.</td></tr>";
        return;
    }

    members.forEach(member => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${member.member_id}</td>
            <td>${member.name}</td>
            <td>${member.email}</td>
            <td>${member.membership_type}</td>
            <td>${member.membership_start}</td>
            <td>${member.total_fine > 0 ? `₹${member.total_fine}` : "No Fine"}</td>
            <td>
                <button class="edit-btn" data-id="${member.member_id}">Edit</button>
                <button class="delete-btn" data-id="${member.member_id}">Delete</button>
            </td>
        `;
        membersTableBody.appendChild(row);
    });

    // ✅ Attach event listeners dynamically
    document.querySelectorAll(".edit-btn").forEach(button => {
        button.addEventListener("click", function () {
            editMember(this.dataset.id);
        });
    });

    document.querySelectorAll(".delete-btn").forEach(button => {
        button.addEventListener("click", function () {
            deleteMember(this.dataset.id);
        });
    });
}


// Function to fetch and display all members (called when search is empty)
async function fetchMembers() {
    try {
        const response = await fetch("http://localhost:3000/api/members");
        if (!response.ok) throw new Error("Failed to fetch members");

        const members = await response.json();
        renderMembers(members);
    } catch (error) {
        console.error("Error fetching members:", error);
    }
}


// Dark mode toggle
document.addEventListener("DOMContentLoaded", () => {
    const darkModeToggle = document.getElementById("darkModeToggle");
    const body = document.body;

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
});
