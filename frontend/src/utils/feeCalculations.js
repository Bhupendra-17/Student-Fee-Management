/**
 * Fee Calculation Utilities (Separated from presentation)
 * Fulfills Section B requirements:
 * - calculatePending(totalFee, paidAmount)
 * - filterPendingStudents(students)
 * - calculateTotals(students)
 * - getHighestPendingStudent(students)
 */

export function calculatePending(totalFee, paidAmount) {
  const total = Number(totalFee) || 0;
  const paid = Number(paidAmount) || 0;
  // Clamped at 0 to prevent negative liability if paid exceeds total
  return Math.max(0, total - paid);
}

export function filterPendingStudents(students) {
  if (!Array.isArray(students)) return [];
  return students.filter(
    (student) => calculatePending(student.totalFee, student.paidAmount) > 0
  );
}

export function calculateTotals(students) {
  if (!Array.isArray(students) || students.length === 0) {
    return { totalStudents: 0, totalFees: 0, totalPaid: 0, totalPending: 0 };
  }

  return students.reduce(
    (acc, s) => {
      const fee = Number(s.totalFee) || 0;
      const paid = Number(s.paidAmount) || 0;
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

export function getHighestPendingStudent(students) {
  if (!Array.isArray(students) || students.length === 0) return null;
  return students.reduce((max, s) => {
    const curPending = calculatePending(s.totalFee, s.paidAmount);
    const maxPending = max ? calculatePending(max.totalFee, max.paidAmount) : -1;
    return curPending > maxPending ? s : max;
  }, null);
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0);
}
