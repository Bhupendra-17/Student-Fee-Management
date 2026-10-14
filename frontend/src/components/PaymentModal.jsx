import React, { useState } from 'react';
import { calculatePending, formatCurrency } from '../utils/feeCalculations';

export default function PaymentModal({ student, onClose, onSubmitPayment }) {
  if (!student) return null;

  const pending = calculatePending(student.totalFee, student.paidAmount);
  const [amount, setAmount] = useState(pending > 0 ? pending : '');
  const [remarks, setRemarks] = useState('Tuition Installment');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      alert('Please enter a valid positive payment amount.');
      return;
    }

    setIsSubmitting(true);
    await onSubmitPayment({
      studentId: student.id,
      amount: numAmount,
      remarks,
    });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Record Fee Payment</h3>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-student-summary">
          <div>
            <strong>Student:</strong> {student.name} (Class {student.class})
          </div>
          <div className="summary-row">
            <span>Total Fee: <strong>{formatCurrency(student.totalFee)}</strong></span>
            <span>Current Paid: <strong className="text-emerald">{formatCurrency(student.paidAmount)}</strong></span>
            <span>Pending: <strong className="text-amber">{formatCurrency(pending)}</strong></span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="payment-form">
          <div className="form-group">
            <label htmlFor="payment-amount">Payment Amount (₹):</label>
            <input
              id="payment-amount"
              type="number"
              min="1"
              max={student.totalFee}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 1000"
              required
              className="text-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="payment-remarks">Payment Remarks / Description:</label>
            <input
              id="payment-remarks"
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Term 2 Installment, Exam fee"
              className="text-input"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Recording...' : 'Submit Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
