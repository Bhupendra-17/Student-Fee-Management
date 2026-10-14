/**
 * ============================================================================
 * Section B: JavaScript and Logical Problem-Solving Solutions
 * Student Fee Management System
 * ============================================================================
 */

/**
 * Problem 1: Calculate pending fees
 * Calculates the pending fee amount for a given student.
 * 
 * Handling when paid amount exceeds total fee:
 * In accounting/fee systems, if a student pays more than the total fee, their
 * pending liability is 0. Any excess amount is an "advance payment" or "credit balance"
 * which can be rolled over to the next semester or refunded.
 * Therefore, we clamp the pending amount to 0 using Math.max(0, ...), and optionally
 * track the advance/overpayment credit separately.
 * 
 * @param {number} totalFee - Total fee allocated to the student
 * @param {number} paidAmount - Total amount paid by the student
 * @returns {number} Pending balance (>= 0)
 */
function calculatePending(totalFee, paidAmount) {
  const total = Number(totalFee) || 0;
  const paid = Number(paidAmount) || 0;
  // Clamped at 0 to avoid negative debt if overpaid
  return Math.max(0, total - paid);
}

/**
 * Problem 2: Filter students
 * Returns only students who have an outstanding (pending) fee balance.
 * 
 * @param {Array<Object>} students - Array of student records
 * @returns {Array<Object>} Students with pending fees > 0
 */
function filterPendingStudents(students) {
  if (!Array.isArray(students)) return [];
  return students.filter((student) => {
    const pending = calculatePending(student.totalFee, student.paidAmount);
    return pending > 0;
  });
}

/**
 * Problem 3: Calculate totals
 * Calculates aggregate totals: total fees, total collected, and total pending amount.
 * 
 * @param {Array<Object>} students - Array of student records
 * @returns {Object} { totalStudents, totalFees, totalPaid, totalPending }
 */
function calculateTotals(students) {
  if (!Array.isArray(students) || students.length === 0) {
    return {
      totalStudents: 0,
      totalFees: 0,
      totalPaid: 0,
      totalPending: 0,
    };
  }

  return students.reduce(
    (acc, student) => {
      const fee = Number(student.totalFee) || 0;
      const paid = Number(student.paidAmount) || 0;
      const pending = calculatePending(fee, paid);

      acc.totalStudents += 1;
      acc.totalFees += fee;
      acc.totalPaid += paid;
      acc.totalPending += pending;
      return acc;
    },
    { totalStudents: 0, totalFees: 0, totalPaid: 0, totalPending: 0 }
  );
}

/**
 * Problem 4: Find the highest pending amount
 * Returns the student object who has the largest pending fee balance.
 * 
 * @param {Array<Object>} students - Array of student records
 * @returns {Object|null} Student with the highest pending fee
 */
function getHighestPendingStudent(students) {
  if (!Array.isArray(students) || students.length === 0) return null;

  return students.reduce((highest, current) => {
    const currentPending = calculatePending(current.totalFee, current.paidAmount);
    const highestPending = highest
      ? calculatePending(highest.totalFee, highest.paidAmount)
      : -1;

    return currentPending > highestPending ? current : highest;
  }, null);
}

/**
 * Problem 5: Logic Question Explanation & Implementation
 * Question:
 * "You have a list of 100 students. Some students have paid their fees in multiple installments.
 *  How would you calculate the total amount collected without counting any installment twice?
 *  Explain your approach. Code is optional for this question."
 * 
 * EXPLANATION:
 * Double-counting in installment systems typically occurs when:
 *  a) A payment transaction is recorded twice due to network retries (lack of idempotency).
 *  b) Transactions are joined with other one-to-many tables (cartesian product in SQL).
 *  c) An aggregate sum is repeatedly recalculated over non-unique records in memory.
 * 
 * APPROACH:
 * 1. Unique Transaction Identifier (Idempotency Key):
 *    Every installment payment is assigned a globally unique ID (e.g. `transaction_id` or UUID).
 * 2. Immutable Ledger / Set Deduplication:
 *    When collecting payments, deduplicate transactions using a Set or Map keyed by the unique transaction ID.
 * 3. Relational Aggregate:
 *    Instead of storing running totals directly on the student table (which easily gets desynchronized),
 *    we sum the ledger: SUM(DISTINCT or unique installment transactions).
 * 
 * Below is a reference demonstration function:
 */
function calculateTotalCollectedSafely(installments) {
  // Use a Map to eliminate duplicate payment transactions based on unique installment ID
  const uniqueTransactions = new Map();

  for (const item of installments) {
    if (item.transactionId && !uniqueTransactions.has(item.transactionId)) {
      uniqueTransactions.set(item.transactionId, Number(item.amount) || 0);
    }
  }

  // Sum up all distinct transactions
  let total = 0;
  for (const amount of uniqueTransactions.values()) {
    total += amount;
  }
  return total;
}

// ============================================================================
// Verification / Test Runner
// ============================================================================
if (require.main === module) {
  console.log("=== Testing JavaScript Solutions ===");

  // Problem 1 Test
  console.log("\n1. calculatePending:");
  console.log("5000, 3000 =>", calculatePending(5000, 3000), "(Expected: 2000)");
  console.log("4000, 4000 =>", calculatePending(4000, 4000), "(Expected: 0)");
  console.log("4000, 5000 (Overpaid) =>", calculatePending(4000, 5000), "(Expected: 0)");

  // Sample Data from Assignment
  const sampleStudents = [
    { id: 1, name: "Aman Sharma", class: "10", totalFee: 5000, paidAmount: 3000 },
    { id: 2, name: "Priya Verma", class: "9", totalFee: 4000, paidAmount: 4000 },
    { id: 3, name: "Rahul Patel", class: "10", totalFee: 6000, paidAmount: 2500 },
    { id: 4, name: "Neha Singh", class: "8", totalFee: 3000, paidAmount: 0 },
    { id: 5, name: "Rohan Das", class: "9", totalFee: 5500, paidAmount: 2000 },
  ];

  // Problem 2 Test
  console.log("\n2. filterPendingStudents:");
  const pendingStudents = filterPendingStudents(sampleStudents);
  console.log(`Found ${pendingStudents.length} students with pending fees:`, 
    pendingStudents.map(s => `${s.name} (Pending: ${calculatePending(s.totalFee, s.paidAmount)})`)
  );

  // Problem 3 Test
  console.log("\n3. calculateTotals:");
  console.log(calculateTotals(sampleStudents));

  // Problem 4 Test
  console.log("\n4. getHighestPendingStudent:");
  const topPending = getHighestPendingStudent(sampleStudents);
  console.log(`Highest pending: ${topPending.name} with pending: ${calculatePending(topPending.totalFee, topPending.paidAmount)}`);

  // Problem 5 Test
  console.log("\n5. calculateTotalCollectedSafely (Deduplicated Installments):");
  const testInstallments = [
    { transactionId: "TX101", studentId: 1, amount: 2000 },
    { transactionId: "TX102", studentId: 1, amount: 1000 },
    { transactionId: "TX102", studentId: 1, amount: 1000 }, // Duplicate webhook/retry!
    { transactionId: "TX103", studentId: 2, amount: 4000 },
  ];
  console.log("Total collected (deduped):", calculateTotalCollectedSafely(testInstallments), "(Expected: 7000)");
}

module.exports = {
  calculatePending,
  filterPendingStudents,
  calculateTotals,
  getHighestPendingStudent,
  calculateTotalCollectedSafely,
};
