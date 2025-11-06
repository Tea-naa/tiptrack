// ShiftList.jsx — Displays all shifts in a table with edit/delete options
// UPDATED: Tax-Free $25K rule now applied to Total Tax (Set Aside)

import React, { useState, useEffect } from 'react';
import { getAllShifts, deleteShift, formatDate, formatCurrency } from '../services/api';
import { Trash2, Edit, Calendar } from 'lucide-react';
import EditShiftModal from './EditShiftModal';

const ShiftList = ({ refreshTrigger, onShiftDeleted }) => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingShift, setEditingShift] = useState(null);

  useEffect(() => {
    loadShifts();
  }, [refreshTrigger]);

  // Fetch all shifts from the backend
  const loadShifts = async () => {
    try {
      setLoading(true);
      const data = await getAllShifts();
      setShifts(data);
      setError(null);
    } catch (err) {
      setError('Failed to load shifts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Delete a specific shift
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this shift?')) return;

    try {
      await deleteShift(id);
      await loadShifts();
      if (onShiftDeleted) onShiftDeleted();
    } catch (err) {
      alert('Failed to delete shift');
      console.error(err);
    }
  };

  // When a shift is updated, refresh the list
  const handleShiftUpdated = () => {
    loadShifts();
    if (onShiftDeleted) onShiftDeleted();
  };

  // =======================
  // LOADING / ERROR STATES
  // =======================
  if (loading) {
    return <div className="shift-list"><p>Loading shifts...</p></div>;
  }

  if (error) {
    return (
      <div className="shift-list">
        <p className="error-message">{error}</p>
        <button onClick={loadShifts}>Retry</button>
      </div>
    );
  }

  if (shifts.length === 0) {
    return (
      <div className="shift-list">
        <div className="empty-state">
          <Calendar size={48} />
          <p>No shifts recorded yet</p>
          <p className="empty-state-hint">Add your first shift to get started!</p>
        </div>
      </div>
    );
  }

  // =======================
  // MAIN TABLE RENDER
  // =======================
  return (
    <div className="shift-list">
      <h3>Shift History ({shifts.length} shifts)</h3>
      
      <div className="table-container">
        <table className="shifts-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Hours</th>
              <th>Total Tips</th>
              <th>Claimed</th>
              <th>Tax (Set Aside)</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {shifts.map((shift) => (
              <tr key={shift._id}>
                <td>{formatDate(shift.date)}</td>
                <td>{shift.hoursWorked}h</td>
                <td className="amount">{formatCurrency(shift.totalTips)}</td>
                <td className="amount claimed">{formatCurrency(shift.claimedTips)}</td>
                <td className="amount tax">{formatCurrency(shift.taxWithholding)}</td>
                <td className="notes-cell">
                  {shift.notes || <span className="no-notes">—</span>}
                </td>
                <td className="actions">
                  <button
                    className="btn-icon btn-edit"
                    title="Edit shift"
                    onClick={() => setEditingShift(shift)}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    className="btn-icon btn-delete"
                    title="Delete shift"
                    onClick={() => handleDelete(shift._id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* =======================
          UPDATED SUMMARY SECTION
          with $25K Tax-Free Logic
      ======================= */}
      <div className="shifts-summary">
        <div className="summary-item">
          <span>Total Shifts:</span>
          <strong>{shifts.length}</strong>
        </div>

        <div className="summary-item">
          <span>Total Earned:</span>
          <strong className="total-earned">
            {formatCurrency(shifts.reduce((sum, s) => sum + s.totalTips, 0))}
          </strong>
        </div>

        <div className="summary-item">
          <span>Total Claimed:</span>
          <strong>
            {formatCurrency(shifts.reduce((sum, s) => sum + s.claimedTips, 0))}
          </strong>
        </div>

        <div className="summary-item">
          <span>Total Tax (Set Aside):</span>
          <strong
            className={`tax-total ${
              shifts.reduce((sum, s) => sum + (s.claimedTips || 0), 0) <= 25000
                ? 'no-tax'
                : ''
            }`}
          >
            {(() => {
              const TAX_FREE_THRESHOLD = 25000;
              const totalClaimed = shifts.reduce(
                (sum, s) => sum + (s.claimedTips || 0),
                0
              );
              const averageTaxRate =
                shifts.length > 0
                  ? shifts.reduce((sum, s) => sum + (s.taxRate || 20), 0) / shifts.length
                  : 20;

              // ✅ Only tax the amount above $25K
              const taxableAmount = Math.max(totalClaimed - TAX_FREE_THRESHOLD, 0);
              const taxOwed = taxableAmount * (averageTaxRate / 100);

              return formatCurrency(taxOwed);
            })()}
          </strong>
        </div>
      </div>

      {/* Edit Modal */}
      {editingShift && (
        <div className="modal-overlay" onClick={() => setEditingShift(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <EditShiftModal
              shift={editingShift}
              onShiftUpdated={handleShiftUpdated}
              onClose={() => setEditingShift(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftList;
