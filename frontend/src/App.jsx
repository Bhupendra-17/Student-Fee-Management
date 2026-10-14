import React, { useState, useEffect, useMemo } from 'react';
import SummaryCards from './components/SummaryCards';
import FilterBar from './components/FilterBar';
import StudentTable from './components/StudentTable';
import PaymentModal from './components/PaymentModal';
import {
  calculatePending,
  calculateTotals,
  getHighestPendingStudent,
} from './utils/feeCalculations';
import { defaultSampleStudents } from './utils/sampleData';

const API_BASE = 'http://localhost:5000/api';

export default function App() {
  const [students, setStudents] = useState(defaultSampleStudents);
  const [dataSource, setDataSource] = useState('connecting');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyPending, setOnlyPending] = useState(false);
  const [sortByPending, setSortByPending] = useState('none');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [notification, setNotification] = useState(null);

  // Fetch students from Node/Express MySQL Backend
  const loadStudents = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/students`);
      if (!res.ok) throw new Error('API server returned error');
      const json = await res.json();
      if (json && Array.isArray(json.data)) {
        setStudents(json.data);
        setDataSource(json.source === 'mysql' ? 'mysql' : 'fallback');
      }
    } catch (err) {
      console.warn('Backend unavailable, using default sample data:', err.message);
      setDataSource('offline');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  // Show transient toast alert
  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Submit payment to MySQL backend or in-memory
  const handlePaymentSubmit = async (payload) => {
    try {
      const res = await fetch(`${API_BASE}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast('Payment successfully saved to MySQL database!', 'success');
        await loadStudents();
      } else {
        throw new Error('Payment request failed');
      }
    } catch (err) {
      // Local state fallback update
      setStudents((prev) =>
        prev.map((s) => {
          if (s.id === payload.studentId) {
            const updatedPaid = Number(s.paidAmount) + payload.amount;
            return {
              ...s,
              paidAmount: updatedPaid,
              pendingAmount: Math.max(0, Number(s.totalFee) - updatedPaid),
            };
          }
          return s;
        })
      );
      showToast('Payment recorded in local state (MySQL offline).', 'info');
    }
  };

  // Separated calculations on full dataset
  const totals = useMemo(() => calculateTotals(students), [students]);
  const highestPending = useMemo(() => getHighestPendingStudent(students), [students]);

  // Filtered & Sorted student list for presentation
  const processedStudents = useMemo(() => {
    let result = [...students];

    // 1. Search by name
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((s) => s.name.toLowerCase().includes(query));
    }

    // 2. Filter pending only
    if (onlyPending) {
      result = result.filter(
        (s) => calculatePending(s.totalFee, s.paidAmount) > 0
      );
    }

    // 3. Sort by pending amount
    if (sortByPending === 'desc') {
      result.sort((a, b) => {
        const pA = calculatePending(a.totalFee, a.paidAmount);
        const pB = calculatePending(b.totalFee, b.paidAmount);
        return pB - pA;
      });
    } else if (sortByPending === 'asc') {
      result.sort((a, b) => {
        const pA = calculatePending(a.totalFee, a.paidAmount);
        const pB = calculatePending(b.totalFee, b.paidAmount);
        return pA - pB;
      });
    }

    return result;
  }, [students, searchQuery, onlyPending, sortByPending]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setOnlyPending(false);
    setSortByPending('none');
  };

  return (
    <div className="app-container">
      {/* Toast Notification */}
      {notification && (
        <div className={`toast-notification toast-${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <header className="app-header">
        <div className="header-brand">
          <div className="logo-badge">🎓</div>
          <div>
            <h1>Student Fee Management</h1>
            <p className="header-subtitle">
              Interactive Dashboard & Database Integration
            </p>
          </div>
        </div>

        <div className="header-status">
          <div className={`db-pill pill-${dataSource}`}>
            <span className="pulse-dot"></span>
            {dataSource === 'mysql' && 'MySQL Database Live'}
            {dataSource === 'fallback' && 'Mock Fallback Mode'}
            {dataSource === 'offline' && 'Offline / Local State'}
            {dataSource === 'connecting' && 'Connecting to DB...'}
          </div>
          <button
            className="btn-refresh"
            onClick={loadStudents}
            title="Reload from MySQL"
            disabled={loading}
          >
            ↻ Refresh
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-content">
        {/* Metric Summary Cards */}
        <SummaryCards totals={totals} highestPending={highestPending} />

        {/* Filter & Search Bar */}
        <section className="table-card">
          <div className="table-header-row">
            <div>
              <h2 className="section-title">Student Fee Records</h2>
              <p className="section-meta">
                Showing {processedStudents.length} of {students.length} students
              </p>
            </div>
          </div>

          <FilterBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onlyPending={onlyPending}
            setOnlyPending={setOnlyPending}
            sortByPending={sortByPending}
            setSortByPending={setSortByPending}
            onReset={handleResetFilters}
          />

          {/* Student Table */}
          <StudentTable
            students={processedStudents}
            onOpenPayment={(student) => setSelectedStudent(student)}
            searchQuery={searchQuery}
          />
        </section>
      </main>

      {/* Payment Modal */}
      {selectedStudent && (
        <PaymentModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          onSubmitPayment={handlePaymentSubmit}
        />
      )}

      {/* Footer */}
      <footer className="app-footer">
        <p>
          Student Fee Management System • Built by - Bhupendra Dewangan
        </p>
      </footer>
    </div>
  );
}
