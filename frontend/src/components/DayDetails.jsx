// DayDetails.jsx - Modal that displays all shifts for a specific day
// Shows when user clicks a calendar day that has shifts
// NOW: Also allows adding shift for empty days

import React, { useState } from 'react';
import { X, Edit, Trash2, Plus } from 'lucide-react';
import { formatCurrency, deleteShift } from '../services/api';
import EditShiftModal from './EditShiftModal';
import AddShiftForm from './AddShiftForm';

const DayDetails = ({ day, month, year, dateKey, shifts, hasShifts, onClose, onShiftUpdated }) => {
  // ==========================================
  // STATE MANAGEMENT
  // ==========================================
  
  // Track which shift is being edited (null = none, object = shift being edited)
  const [editingShift, setEditingShift] = useState(null);
  
  // Track if user wants to add a shift (for empty days)
  const [showAddForm, setShowAddForm] = useState(false);

  // ==========================================
  // EVENT HANDLERS
  // ==========================================
  
  // Delete a shift with confirmation
  const handleDelete = async (id) => {
    // Ask user to confirm before deleting
    if (!window.confirm('Delete this shift?')) return;
    
    try {
      await deleteShift(id); // Call API to delete
      onShiftUpdated(); // Tell parent to refresh data
      
      // If this was the only shift on this day, close the modal
      if (shifts.length === 1) {
        onClose();
      }
    } catch (error) {
      alert('Failed to delete shift');
      console.error(error);
    }
  };

  // ==========================================
  // HELPER DATA
  // ==========================================
  
  // Month names for header display
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  // ==========================================
  // RENDER COMPONENT
  // ==========================================
  return (
    <div className="day-details">
      {/* HEADER - Shows date and close button */}
      <div className="details-header">
        <h3>{monthNames[month - 1]} {day}, {year}</h3>
        <button onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      {/* IF NO SHIFTS - Show "Add Shift" prompt */}
      {!hasShifts && !showAddForm && (
        <div className="empty-day-prompt">
          <p className="empty-day-text">No shifts recorded for this day</p>
          <button 
            className="btn-add-shift-day" 
            onClick={() => setShowAddForm(true)}
          >
            <Plus size={16} /> Add Shift for {monthNames[month - 1]} {day}
          </button>
        </div>
      )}

      {/* IF ADDING SHIFT - Show AddShiftForm */}
      {showAddForm && (
        <AddShiftForm
          initialDate={dateKey}
          onShiftAdded={() => {
            setShowAddForm(false);
            onShiftUpdated();
          }}
          onClose={() => setShowAddForm(false)}
        />
      )}

      {/* SHIFT CARDS - One for each shift on this day */}
      {hasShifts && shifts.map(shift => (
        <div key={shift._id} className="shift-detail-card">
          
          {/* Hours Worked */}
          <div className="detail-row">
            <span>Hours:</span>
            <strong>{shift.hoursWorked}h</strong>
          </div>

          {/* Total Tips (what you actually earned) */}
          <div className="detail-row">
            <span>Total Tips:</span>
            <strong className="highlight">{formatCurrency(shift.totalTips)}</strong>
          </div>

          {/* Claimed Tips (what you reported) */}
          <div className="detail-row">
            <span>Claimed:</span>
            <strong>{formatCurrency(shift.claimedTips)}</strong>
          </div>

          {/* Tax Withholding (money to set aside) */}
          <div className="detail-row">
            <span>Tax (Set Aside):</span>
            <strong className="tax">{formatCurrency(shift.taxWithholding)}</strong>
          </div>

          {/* Notes (optional - only show if shift has notes) */}
          {shift.notes && (
            <div className="detail-notes">
              <span>Notes:</span>
              <p>{shift.notes}</p>
            </div>
          )}

          {/* Action Buttons (Edit / Delete) */}
          <div className="detail-actions">
            <button 
              className="btn-edit" 
              onClick={() => setEditingShift(shift)}
            >
              <Edit size={16} /> Edit
            </button>
            
            <button 
              className="btn-delete" 
              onClick={() => handleDelete(shift._id)}
            >
              <Trash2 size={16} /> Delete
            </button>
          </div>
        </div>
      ))}

      {/* EDIT MODAL - Shows when user clicks Edit button */}
      {editingShift && (
        <div 
          className="modal-overlay" 
          onClick={() => setEditingShift(null)}
        >
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()}
          >
            <EditShiftModal
              shift={editingShift}
              onShiftUpdated={() => {
                setEditingShift(null); // Close edit modal
                onShiftUpdated(); // Refresh parent data
              }}
              onClose={() => setEditingShift(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DayDetails;

// ==========================================
// COMPONENT EXPLANATION:
// ==========================================
// 
// This component receives PROPS from ShiftCalendar:
// - day: 4 (the day number)
// - month: 11 (November)
// - year: 2025
// - shifts: [shift1, shift2] (array of shifts for this day)
// - onClose: function to close the modal
// - onShiftUpdated: function to tell parent to refresh data
//
// It displays:
// 1. A header with the date
// 2. A card for each shift on that day
// 3. Edit/Delete buttons for each shift
// 4. An edit modal when user clicks Edit
