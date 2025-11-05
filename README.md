# Library Management System

A full-featured library management application designed to help manage books, members, and transactions efficiently. Built for academic purposes, this system integrates a user-friendly frontend with a backend database to support basic library workflows and improve operational transparency.

---

## 1. Overview

The Library Management System allows library administrators to manage book inventories, register and track members, issue and return books, compute fines for overdue items, and generate reports of current holdings and circulation. The project emphasizes modular design, persistence using a relational database, and a clean user interface.

---

## 2. Features

- **Member Management:** Register new members, update member information, view member lists.  
- **Book Inventory:** Add, edit, delete books; view availability and book details.  
- **Issue & Return Transactions:** Issue books to members, record returns, automatically update book status.  
- **Fine Calculation:** Automated fine calculation based on overdue days.  
- **Search & Filter:** Search for books and members by multiple criteria (title, author, ID, etc.).  
- **Reports & Activity Logs:** View lists of issued books, overdue items, member borrowing history.  
- **Database Integration:** Backend storage via a relational database to maintain persistent data.

---

## 3. Technology Stack

| Component            | Technology Used                     |
|----------------------|------------------------------------|
| Front-end / UI       | HTML, CSS, JavaScript               |
| Backend / Server     | Node.js with Express (or Java/Servlets if applicable) |
| Database             | MySQL       |
| ORM/Database Access  | MySQL Connector / Sequelize / JDBC  |
| Tools & Package Mgmt | npm          |
| Recommended IDE      | VS Code   |


---

## 4. Project Structure

Library-Management-System/
│
├── routes/ # Server-side route handlers
├── public/ # Static assets (CSS, JS, images)
│ ├── styles.css
│ └── script.js
├── views/ # HTML / templating files (if using renders)
├── server.js (or app.js) # Entry point of the application
├── db.js (or DatabaseConnection.java) # Database connection and configuration
├── lib.sql # Database schema and seed data
├── package.json (or pom.xml) # Project metadata and dependencies
└── README.md # This documentation file

---

## 5. Installation & Setup

### Prerequisites  
Ensure the following are installed on your system:
- A recent version of Node.js (or Java JDK 8+ if Java-based)  
- MySQL Server (or another supported RDBMS)  
- A code editor such as VS Code or IntelliJ IDEA

### Database Setup  
1. Open your DBMS (e.g., MySQL Workbench).  
2. Create a new database, for example:

   ```sql
   CREATE DATABASE library_db;
   USE library_db;
3. Import the lib.sql file to create tables and initial data.



Configure the Application

Open the configuration file (db.js, DatabaseConnection.java, or equivalent).
Update the database connection parameters:

const dbConfig = {
  host: "localhost",
  user: "root",
  password: "your_password",
  database: "library_db"
};


Install dependencies:
npm install


---

## 6. Compilation & Execution

If using Node.js:

node server.js
If using Java + Swing / Servlets:

javac -cp ".;lib/mysql-connector-java-8.0.xx.jar" src/**/*.java
java -cp ".;lib/mysql-connector-java-8.0.xx.jar;src" Main

Then navigate to the application in your browser (for web-based) or launch the UI (for desktop-based) and log in using provided credentials.