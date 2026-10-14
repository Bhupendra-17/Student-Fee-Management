import React from 'react';
import { formatCurrency } from '../utils/feeCalculations';

export default function SummaryCards({ totals, highestPending }) {
  const cards = [
    {
      title: 'Total Students',
      value: totals.totalStudents,
      colorClass: 'card-blue',
      icon: '👥',
      subtext: 'Registered students',
    },
    {
      title: 'Total Fees',
      value: formatCurrency(totals.totalFees),
      colorClass: 'card-purple',
      icon: '💼',
      subtext: 'Allocated curriculum fee',
    },
    {
      title: 'Total Collected',
      value: formatCurrency(totals.totalPaid),
      colorClass: 'card-green',
      icon: '💰',
      subtext: `${totals.totalFees ? Math.round((totals.totalPaid / totals.totalFees) * 100) : 0}% collected`,
    },
    {
      title: 'Total Pending',
      value: formatCurrency(totals.totalPending),
      colorClass: 'card-amber',
      icon: '⏳',
      subtext: highestPending
        ? `Highest: ${highestPending.name} (${formatCurrency(highestPending.pendingAmount || (highestPending.totalFee - highestPending.paidAmount))})`
        : 'All accounts clear',
    },
  ];

  return (
    <div className="summary-grid">
      {cards.map((card, idx) => (
        <div key={idx} className={`summary-card ${card.colorClass}`}>
          <div className="card-header">
            <span className="card-title">{card.title}</span>
            <span className="card-icon">{card.icon}</span>
          </div>
          <div className="card-value">{card.value}</div>
          <div className="card-subtext">{card.subtext}</div>
        </div>
      ))}
    </div>
  );
}
