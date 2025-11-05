-- Create the database
CREATE DATABASE library_db;
USE library_db;

-- Users table
CREATE TABLE users (
    username VARCHAR(50) NOT NULL UNIQUE PRIMARY KEY,
    password VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE
);

-- Insert default admin user (password should be hashed in real apps)
INSERT INTO users (username, password, email) VALUES
('admin', 'password', 'admin@example.com'),
('user1', 'password1', 'user1@example.com'),
('user2', 'password2', 'user2@example.com'),
('user3', 'password3', 'user3@example.com'),
('user4', 'password4', 'user4@example.com'),
('user5', 'password5', 'user5@example.com');

-- Books table
CREATE TABLE books (
    book_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    genre VARCHAR(100),
    published_year INT,
    total_copies INT NOT NULL,
    available_copies INT NOT NULL
);

-- Insert books data
INSERT INTO books (title, author, genre, published_year, available_copies, total_copies) VALUES
-- Fiction
('To Kill a Mockingbird', 'Harper Lee', 'Fiction', 1960, 5, 5),
('The Great Gatsby', 'F. Scott Fitzgerald', 'Fiction', 1925, 3, 3),

-- Fantasy
('Harry Potter and the Sorcerer''s Stone', 'J.K. Rowling', 'Fantasy', 1997, 7, 7),
('The Hobbit', 'J.R.R. Tolkien', 'Fantasy', 1937, 4, 4),

-- Romance
('Pride and Prejudice', 'Jane Austen', 'Romance', 1813, 6, 6),
('Me Before You', 'Jojo Moyes', 'Romance', 2012, 5, 5),

-- Science and Technology
('A Brief History of Time', 'Stephen Hawking', 'Science and Technology', 1988, 2, 2),
('The Innovators', 'Walter Isaacson', 'Science and Technology', 2014, 3, 3),

-- History
('Sapiens: A Brief History of Humankind', 'Yuval Noah Harari', 'History', 2011, 4, 4),
('The Diary of a Young Girl', 'Anne Frank', 'History', 1947, 6, 6),

-- Classic
('1984', 'George Orwell', 'Classic', 1949, 5, 5),
('Moby-Dick', 'Herman Melville', 'Classic', 1851, 2, 2),

-- Horror
('It', 'Stephen King', 'Horror', 1986, 3, 3),
('Dracula', 'Bram Stoker', 'Horror', 1897, 4, 4),

-- Mystery & Thriller
('Gone Girl', 'Gillian Flynn', 'Mystery & Thriller', 2012, 5, 5),
('The Girl with the Dragon Tattoo', 'Stieg Larsson', 'Mystery & Thriller', 2005, 3, 3),

-- Self-Help
('The Power of Habit', 'Charles Duhigg', 'Self-Help', 2012, 4, 4),
('Atomic Habits', 'James Clear', 'Self-Help', 2018, 6, 6),

-- Biography & Memoir
('Becoming', 'Michelle Obama', 'Biography & Memoir', 2018, 5, 5),
('Steve Jobs', 'Walter Isaacson', 'Biography & Memoir', 2011, 3, 3);


-- Members table
CREATE TABLE members (
    member_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    membership_type ENUM('VIP', 'Premium', 'Standard') NOT NULL DEFAULT 'Standard',
    membership_start DATE NOT NULL
);

-- Insert sample members
INSERT INTO members (name, email, membership_type, membership_start) VALUES
('John Doe', 'john@example.com', 'Premium', '2024-01-10'),
('Jane Smith', 'jane@example.com', 'Standard', '2024-03-01'),
('Alice Johnson', 'alice@example.com', 'Standard', '2024-02-15'),
('Bob Williams', 'bob@example.com', 'Premium', '2024-04-10'),
('Charlie Brown', 'charlie@example.com', 'Standard', '2024-01-20'),
('David Wilson', 'david@example.com', 'VIP', '2024-03-05'),
('Eva Thomas', 'eva@example.com', 'Premium', '2024-02-28');

-- Borrowed books table
CREATE TABLE borrowed_books (
    borrow_id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT NOT NULL,
    book_id INT NOT NULL,
    borrow_date DATE NOT NULL,
    due_date DATE NOT NULL,
    return_date DATE DEFAULT NULL,
    FOREIGN KEY (member_id) REFERENCES members(member_id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(book_id) ON DELETE CASCADE
);

-- Insert sample borrowing records
INSERT INTO borrowed_books (member_id, book_id, borrow_date, due_date) VALUES
(1, 1, '2025-03-15', '2025-03-30'),
(2, 3, '2025-03-10', '2025-03-25'),
(3, 5, '2025-02-15', '2025-03-01'),
(4, 7, '2025-03-18', '2025-04-02'),
(5, 9, '2025-03-22', '2025-04-06'),
(6, 11, '2025-03-25', '2025-04-09');

-- Fines table
CREATE TABLE fines (
    fine_id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT NOT NULL,
    book_id INT NOT NULL,
    fine_amount DECIMAL(10,2) NOT NULL,
    paid BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (member_id) REFERENCES members(member_id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(book_id) ON DELETE CASCADE
);

-- Insert sample fines
INSERT INTO fines (member_id, book_id, fine_amount, paid) VALUES
(1, 1, 200.00, FALSE),
(2, 3, 150.00, FALSE),
(3, 5, 100.00, TRUE),
(4, 7, 200.00, FALSE),
(5, 9, 120.00, TRUE),
(6, 11, 250.00, FALSE);


select * from users;
select * from borrowed_books;
select * from fines;
select * from books;

-- Find members who have fines
SELECT m.member_id, m.name
FROM members m
WHERE EXISTS (
    SELECT 1
    FROM fines f
    WHERE f.member_id = m.member_id AND f.paid = 0
);

-- Calculate loan duration for returned books
SELECT bb.borrow_id, b.title, m.name,
       bb.borrow_date, bb.return_date,
       DATEDIFF(bb.return_date, bb.borrow_date) AS loan_days
FROM borrowed_books bb
JOIN books b ON bb.book_id = b.book_id
JOIN members m ON bb.member_id = m.member_id
WHERE bb.return_date IS NOT NULL;


-- Count books by century of publication
SELECT 
    CASE 
        WHEN published_year < 1800 THEN 'Before 1800'
        WHEN published_year BETWEEN 1800 AND 1899 THEN '19th Century'
        WHEN published_year BETWEEN 1900 AND 1999 THEN '20th Century'
        ELSE '21st Century'
    END AS century,
    COUNT(*) AS book_count
FROM books
GROUP BY century
ORDER BY MIN(published_year);

-- Find books in specific genres
SELECT title, author, genre
FROM books
WHERE genre IN ('Fiction', 'Fantasy', 'Adventure');

-- Get the 5 oldest books in the library
SELECT title, author, published_year
FROM books
ORDER BY published_year ASC
LIMIT 5;

-- Calculate the total and average number of copies per genre
SELECT genre, 
       SUM(total_copies) AS total_copies, 
       AVG(total_copies) AS average_copies
FROM books
GROUP BY genre;

-- Format book titles and authors
SELECT 
    UPPER(title) AS title_uppercase,
    CONCAT(SUBSTRING(author, 1, 1), '. ', SUBSTRING_INDEX(author, ' ', -1)) AS author_formatted
FROM books;

-- Rank books by number of copies within each genre
SELECT 
    title, 
    author, 
    genre, 
    total_copies,
    RANK() OVER (PARTITION BY genre ORDER BY total_copies DESC) AS rank_in_genre
FROM books;

-- List all books published after 2000
SELECT book_id, title, author, published_year
FROM books
WHERE published_year > 2000;


SELECT b.title, bb.borrow_date 
FROM borrowed_books bb
JOIN books b ON bb.book_id = b.book_id
WHERE bb.borrow_date >= CURDATE() - INTERVAL 30 DAY;

SELECT genre, COUNT(book_id) AS books_count 
FROM books 
GROUP BY genre 
ORDER BY books_count DESC 
LIMIT 1;


