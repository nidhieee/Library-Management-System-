document.addEventListener("DOMContentLoaded", function () {
    // Get elements
    const emailModal = document.getElementById("emailModal");
    const passwordModal = document.getElementById("passwordModal");
    const openEmailModalBtn = document.getElementById("openChangeEmailModal");
    const openPasswordModalBtn = document.getElementById("openChangePasswordModal");
    const closeButtons = document.querySelectorAll(".close-btn");
    const logoutButtons = document.querySelectorAll("#logoutBtn, #logoutBtn2");
    const userNameElement = document.getElementById("userName");
    const userEmailElement = document.getElementById("userEmail");

    // Get logged-in username from localStorage
    const loggedInUser = localStorage.getItem("username");
    
    if (!loggedInUser) {
        console.error("No logged-in user found.");
        return;
    }

    // Forms
    const emailForm = document.getElementById("changeEmailForm");
    const passwordForm = document.getElementById("changePasswordForm");

    // Dark Mode Toggle
    const toggle = document.getElementById("darkModeToggle");
    const body = document.body;

    // Load dark mode preference
    if (localStorage.getItem("darkMode") === "enabled") {
        body.classList.add("dark-mode");
        if (toggle) toggle.checked = true;
    }

    if (toggle) {
        toggle.addEventListener("change", () => {
            if (toggle.checked) {
                body.classList.add("dark-mode");
                localStorage.setItem("darkMode", "enabled");
            } else {
                body.classList.remove("dark-mode");
                localStorage.setItem("darkMode", "disabled");
            }
        });
    }

    // Open modals
    if (openEmailModalBtn) {
        openEmailModalBtn.addEventListener("click", () => emailModal.style.display = "block");
    }
    
    if (openPasswordModalBtn) {
        openPasswordModalBtn.addEventListener("click", () => passwordModal.style.display = "block");
    }

    // Close modals
    closeButtons.forEach(button => {
        button.addEventListener("click", () => {
            emailModal.style.display = "none";
            passwordModal.style.display = "none";
        });
    });

    // Fetch user details from backend
    function fetchUserDetails() {
        const username = localStorage.getItem("username");
    
        if (!username) {
            console.error("⚠️ Username is missing in localStorage. Redirecting to login.");
            window.location.href = "login.html"; // Redirect if not logged in
            return;
        }
    
        console.log("Fetching user details for:", username); // Debugging
    
        fetch(`http://localhost:3000/api/settings/user?username=${encodeURIComponent(username)}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    document.getElementById("userName").textContent = data.user.username;
                    document.getElementById("userEmail").textContent = data.user.email;
                } else {
                    console.error("❌ Failed to fetch user details:", data.message);
                }
            })
            .catch(error => console.error("❌ Error fetching user details:", error));
    }
    
    // Call function when page loads
    fetchUserDetails();

    window.addEventListener("click", (event) => {
        if (event.target === emailModal) emailModal.style.display = "none";
        if (event.target === passwordModal) passwordModal.style.display = "none";
    });

    // Logout
    logoutButtons.forEach(button => {
        button.addEventListener("click", () => {
            localStorage.removeItem("username"); // ✅ Only removes username
            localStorage.removeItem("token"); // ✅ Only removes token
            window.location.href = "login.html";
        });
    });

    // Handle Email Update
    emailForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const newEmail = document.getElementById("newEmail").value.trim();
        const username = localStorage.getItem("username");

        if (!newEmail) {
            alert("Please enter a valid email.");
            return;
        }

        fetch("http://localhost:3000/api/settings/update-email", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, newEmail })
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            if (data.success) {
                userEmailElement.textContent = newEmail;
            }
            emailModal.style.display = "none";
        })
        .catch(error => console.error("Error updating email:", error));
    });

    // Handle Password Update
    passwordForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const currentPassword = document.getElementById("currentPassword").value;
        const newPassword = document.getElementById("newPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        const username = localStorage.getItem("username");

        if (!currentPassword || !newPassword || !confirmPassword) {
            alert("Please fill in all fields.");
            return;
        }

        if (newPassword !== confirmPassword) {
            alert("New password and confirmation do not match.");
            return;
        }

        fetch("http://localhost:3000/api/settings/update-password", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, currentPassword, newPassword })
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            if (data.success) {
                passwordModal.style.display = "none";
            }
        })
        .catch(error => console.error("Error updating password:", error));
    });
});
