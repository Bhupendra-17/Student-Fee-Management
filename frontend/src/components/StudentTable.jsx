import React from 'react';
import { formatCurrency, calculatePending } from '../utils/feeCalculations';

export default function StudentTable({ students, onOpenPayment, searchQuery }) {
  if (students.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📂</div>
        <h3>No Students Found</h3>
        <p>
          {searchQuery
            ? `No matching student found for "${searchQuery}". Try a different name.`
            : 'No students match the selected filter criteria.'}
        </p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="fee-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Student Name</th>
            <th>Class</th>
            <th className="text-right">Total Fee</th>
            <th className="text-right">Paid Amount</th>
            <th className="text-right">Pending Amount</th>
            <th className="text-center">Status</th>
            <th className="text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => {
            const pending = calculatePending(student.totalFee, student.paidAmount);
            const isFullyPaid = pending === 0;

            return (
              <tr key={student.id} className={isFullyPaid ? 'row-paid' : 'row-pending'}>
                <td className="font-mono">#{student.id}</td>
                <td className="student-name">
                  <div className="avatar">{student.name.charAt(0)}</div>
                  <span>{student.name}</span>
                </td>
                <td>
                  <span className="class-pill">Class {student.class}</span>
                </td>
                <td className="text-right">{formatCurrency(student.totalFee)}</td>
                <td className="text-right font-medium text-emerald">
                  {formatCurrency(student.paidAmount)}
                </td>
                <td className="text-right font-semibold">
                  {pending > 0 ? (
                    <span className="text-amber">{formatCurrency(pending)}</span>
                  ) : (
                    <span className="text-muted">₹0</span>
                  )}
                </td>
                <td className="text-center">
                  {isFullyPaid ? (
                    <span className="status-badge badge-paid">
                      <span className="dot"></span> Fully Paid
                    </span>
                  ) : (
                    <span className="status-badge badge-pending">
                      <span className="dot"></span> Pending
                    </span>
                  )}
                </td>
                <td className="text-center">
                  <button
                    className="btn-pay"
                    onClick={() => onOpenPayment(student)}
                    disabled={isFullyPaid}
                    title={isFullyPaid ? 'Fee is already fully cleared' : 'Record an installment payment'}
                  >
                    {isFullyPaid ? 'Cleared' : '+ Pay'}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
