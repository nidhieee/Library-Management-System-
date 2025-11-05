document.getElementById("loginForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    let username = document.getElementById("username").value.trim();
    let password = document.getElementById("password").value.trim();

    try {
        const response = await fetch("http://localhost:3000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (response.ok) {
            // ✅ Store user details properly
            localStorage.setItem("token", data.token);
            localStorage.setItem("username", data.username); // ✅ This was missing before
            
            console.log("Stored username:", localStorage.getItem("username")); // Debugging

            window.location.href = "index.html"; // Redirect to dashboard
        } else {
            document.getElementById("error-message").textContent = data.message;
        }

    } catch (error) {
        console.error("Login error:", error);
        document.getElementById("error-message").textContent = "Server error. Please try again.";
    }
});
