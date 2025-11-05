const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(cors({
    origin: ["http://127.0.0.1:8080", "http://localhost:5500"],  // Allow both Live Server & http-server
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));


app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MySQL Database Connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.error("❌ Database connection failed:", err);
        return;
    }
    console.log("✅ Connected to MySQL Database!");
});

// Import routes
const memberRoutes = require("./routes/members");
const bookRoutes = require("./routes/books");
const fineRoutes = require("./routes/fine");
const authRoutes = require("./routes/auth");
const trendingRoutes = require("./routes/trending");
const dashboardRoutes = require("./routes/dashboard");
const settingsRoutes = require("./routes/settings");
const borrowRoutes = require("./routes/borrow");

// Use routes
app.use("/api/members", memberRoutes);
app.use("/api/members", require("./routes/members"));
app.use("/api/books", bookRoutes);
app.use("/api/fine", fineRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/trending", trendingRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/borrow", borrowRoutes);

app.listen(3000, () => {
    console.log("🚀 Server running on http://localhost:3000");
});
