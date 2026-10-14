-- ============================================================================
-- Section C: SQL and Database Fundamentals Solutions
-- Student Fee Management System
-- ============================================================================

USE student_fee_db;

-- ----------------------------------------------------------------------------
-- Task 1: Retrieve all students
-- ----------------------------------------------------------------------------
SELECT 
    id, 
    name, 
    class, 
    total_fee 
FROM students;

-- ----------------------------------------------------------------------------
-- Task 2: Retrieve all payments made by a particular student (e.g., student_id = 1)
-- ----------------------------------------------------------------------------
SELECT 
    id, 
    student_id, 
    amount, 
    payment_date, 
    remarks 
FROM payments 
WHERE student_id = 1
ORDER BY payment_date ASC;

-- ----------------------------------------------------------------------------
-- Task 3: Calculate the total amount paid by each student
-- ----------------------------------------------------------------------------
SELECT 
    student_id, 
    SUM(amount) AS total_paid
FROM payments
GROUP BY student_id;

-- ----------------------------------------------------------------------------
-- Task 4: Display every student alongside their total paid amount, 
--         including students who have not made any payments.
-- ----------------------------------------------------------------------------
-- Note: We use LEFT JOIN so students with zero payments (like Neha Singh) are included,
-- and COALESCE ensures NULL sums are displayed as 0.00.
SELECT 
    s.id AS student_id,
    s.name AS student_name,
    s.class,
    s.total_fee,
    COALESCE(SUM(p.amount), 0.00) AS total_paid,
    (s.total_fee - COALESCE(SUM(p.amount), 0.00)) AS pending_fee
FROM students s
LEFT JOIN payments p ON s.id = p.student_id
GROUP BY s.id, s.name, s.class, s.total_fee
ORDER BY s.id ASC;

-- ----------------------------------------------------------------------------
-- Task 5: Find students whose total payments exceed 5,000
-- ----------------------------------------------------------------------------
-- Using HAVING clause to filter after grouping and summing payments
SELECT 
    s.id,
    s.name,
    SUM(p.amount) AS total_paid
FROM students s
JOIN payments p ON s.id = p.student_id
GROUP BY s.id, s.name
HAVING SUM(p.amount) > 5000.00;

-- ----------------------------------------------------------------------------
-- Task 6: Find the total amount collected during a given month (e.g., August 2026)
-- ----------------------------------------------------------------------------
SELECT 
    COALESCE(SUM(amount), 0.00) AS total_collected_august_2026
FROM payments
WHERE payment_date >= '2026-08-01' AND payment_date < '2026-09-01';

-- Alternative syntax using DATE_FORMAT:
-- SELECT SUM(amount) AS total_collected FROM payments WHERE DATE_FORMAT(payment_date, '%Y-%m') = '2026-08';


-- ============================================================================
-- Conceptual Questions & Explanations
-- ============================================================================

/*
Task 7: Explain the difference between INNER JOIN and LEFT JOIN.
-------------------------------------------------------------------------------
1. INNER JOIN:
   - Returns ONLY the records where there is a matching value in BOTH joined tables.
   - If a student has made zero payments, an INNER JOIN between `students` and `payments` 
     will completely omit that student from the result set.
   - Use case: When you only want to inspect actual payment transactions alongside student details.

2. LEFT JOIN (or LEFT OUTER JOIN):
   - Returns ALL records from the left table (`students`), along with matched records 
     from the right table (`payments`).
   - If a student has no corresponding rows in `payments`, the columns from `payments` 
     will be populated with `NULL` values.
   - Use case: Required for comprehensive fee reporting (like Task 4) where EVERY student must 
     be visible regardless of whether they have started paying or not. Using COALESCE(..., 0) 
     converts NULL to 0.

-------------------------------------------------------------------------------
Task 8: Explain why a foreign key is useful.
-------------------------------------------------------------------------------
1. Referential Integrity:
   - Guarantees that every payment record refers to a valid, existing student. 
     You cannot accidentally record a payment for a student ID that does not exist.

2. Prevention of Orphan Records:
   - Avoids "dangling" payments in the database if student records are updated or deleted.

3. Cascading Operations:
   - By declaring `ON DELETE CASCADE` or `ON UPDATE CASCADE`, if a student record is removed 
     or its ID changed, the associated payment history is automatically maintained consistently.

4. Performance & Query Optimization:
   - Database query planners use foreign key relationships and their underlying indexes 
     to optimize JOIN operations between related tables.

-------------------------------------------------------------------------------
Additional Database Task: Schema Design Supporting Multiple Payments
-------------------------------------------------------------------------------
Design Overview:
- Relational 1-to-Many Architecture:
  * Table `students` holds the master entity information (student identity, class, total allocated fee).
  * Table `payments` holds individual payment transactions (id, student_id, amount, payment_date, remarks).
- How Multiple Payments are Supported:
  * One student row in `students` can relate to 0, 1, or many rows in `payments`.
  * Each payment is recorded as an independent immutable transaction row with its own timestamp, 
    receipt number/id, and amount.
  * The student's cumulative paid amount is derived dynamically via `SUM(amount)` in SQL queries or views.
  * This guarantees that installments (e.g. Term 1, Term 2, Exam fee) never overwrite previous payments, 
    maintaining a complete audit trail without data duplication.
*/
