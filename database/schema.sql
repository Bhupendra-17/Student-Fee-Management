-- ==============================================================
-- Student Fee Management System - Database Schema & Seed Data
-- ==============================================================

CREATE DATABASE IF NOT EXISTS student_fee_db;
USE student_fee_db;

-- 1. Students Table
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS students;

CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    class VARCHAR(20) NOT NULL,
    total_fee DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Payments Table (Supports Multiple Installment Payments per Student)
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    payment_date DATE NOT NULL,
    remarks VARCHAR(255) DEFAULT 'Tuition Fee Installment',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payments_student 
        FOREIGN KEY (student_id) REFERENCES students(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
);

-- Index to optimize querying payments by student
CREATE INDEX idx_payments_student_id ON payments(student_id);

-- ==============================================================
-- Sample Data Insertion (As per Technical Assignment Specifications)
-- ==============================================================

INSERT INTO students (id, name, class, total_fee) VALUES
(1, 'Aman Sharma', '10', 5000.00),
(2, 'Priya Verma', '9', 4000.00),
(3, 'Rahul Patel', '10', 6000.00),
(4, 'Neha Singh', '8', 3000.00),
(5, 'Rohan Das', '9', 5500.00);

-- Payments (Simulating installment payments)
INSERT INTO payments (student_id, amount, payment_date, remarks) VALUES
(1, 2000.00, '2026-08-10', 'Term 1 Installment'),
(1, 1000.00, '2026-09-15', 'Term 2 Installment'), -- Aman total = 3000
(2, 4000.00, '2026-08-05', 'Full Payment'),        -- Priya total = 4000
(3, 1500.00, '2026-08-20', 'Installment 1'),
(3, 1000.00, '2026-09-22', 'Installment 2'),        -- Rahul total = 2500
-- Neha Singh has made 0 payments
(5, 2000.00, '2026-09-01', 'Installment 1');        -- Rohan total = 2000
