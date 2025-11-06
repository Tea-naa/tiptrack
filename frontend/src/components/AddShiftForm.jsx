// Form to add a new shift
// Features: Toggle between "just total" vs "cash/credit" entry

import React, { useState } from 'react';
import { createShift, formatDateForInput, formatDateForBackend } from '../services/api';  // ← ADD formatDateForBackend
import { Plus, X } from 'lucide-react';

const AddShiftForm = ({ onShiftAdded, onClose, initialDate }) => {
  // FORM STATE - stores all form fields
  const [formData, setFormData] = useState({
    date: initialDate || formatDateForInput(new Date()),  // Use initialDate if provided
    hoursWorked: '',
    totalTips: '',
    cashTips: '',
    creditTips: '',
    claimedTips: '',
    taxRate: 20,  // Default 20%
    notes: '',
  });

  // UI STATE
  const [useSeparateEntry, setUseSeparateEntry] = useState(false);  // Toggle for cash/credit
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle input changes
  // This updates formData when user types
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,  // Keep all other fields the same
      [name]: value  // Update only this field
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();  // Prevent page reload
    
    try {
      setLoading(true);
      setError(null);

      // Prepare data for backend
      const shiftData = {
        date: formatDateForBackend(formData.date),  // ← FIX: Convert date properly
        hoursWorked: parseFloat(formData.hoursWorked),
        claimedTips: parseFloat(formData.claimedTips),
        taxRate: parseFloat(formData.taxRate),
        notes: formData.notes,
      };

      // Add tip data based on entry mode
      if (useSeparateEntry) {
        // User entered cash + credit separately
        shiftData.cashTips = parseFloat(formData.cashTips) || 0;
        shiftData.creditTips = parseFloat(formData.creditTips) || 0;
        shiftData.totalTips = shiftData.cashTips + shiftData.creditTips;
      } else {
        // User entered just total
        shiftData.totalTips = parseFloat(formData.totalTips);
        shiftData.cashTips = 0;
        shiftData.creditTips = 0;
      }

      // Send to backend
      await createShift(shiftData);
      
      // Success! Reset form and close
      resetForm();
      onShiftAdded();  // Tell parent to refresh data
      if (onClose) onClose();  // Close modal if exists
      
    } catch (err) {
      setError('Failed to create shift. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      date: formatDateForInput(new Date()),
      hoursWorked: '',
      totalTips: '',
      cashTips: '',
      creditTips: '',
      claimedTips: '',
      taxRate: 20,
      notes: '',
    });
  };

  return (
    <div className="add-shift-form">
      {/* Header */}
      <div className="form-header">
        <h3><Plus size={20} /> Add New Shift</h3>
        {onClose && (
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        )}
      </div>

      {/* Error message */}
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Date */}
        <div className="form-group">
          <label htmlFor="date">Date</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>

        {/* Hours Worked */}
        <div className="form-group">
          <label htmlFor="hoursWorked">Hours Worked</label>
          <input
            type="number"
            id="hoursWorked"
            name="hoursWorked"
            value={formData.hoursWorked}
            onChange={handleChange}
            min="0"
            step="0.5"
            placeholder="6"
            required
          />
        </div>

        {/* Toggle: Simple vs Detailed Entry */}
        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={useSeparateEntry}
              onChange={(e) => setUseSeparateEntry(e.target.checked)}
            />
            <span>Track cash and credit separately</span>
          </label>
        </div>

        {/* CONDITIONAL RENDERING - show different fields based on toggle */}
        {useSeparateEntry ? (
          // Separate Cash/Credit Entry
          <>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="cashTips">Cash Tips ($)</label>
                <input
                  type="number"
                  id="cashTips"
                  name="cashTips"
                  value={formData.cashTips}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="100"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="creditTips">Credit Tips ($)</label>
                <input
                  type="number"
                  id="creditTips"
                  name="creditTips"
                  value={formData.creditTips}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="100"
                  required
                />
              </div>
            </div>

            {/* Show calculated total */}
            {formData.cashTips && formData.creditTips && (
              <div className="calculated-total">
                Total Tips: ${(parseFloat(formData.cashTips) + parseFloat(formData.creditTips)).toFixed(2)}
              </div>
            )}
          </>
        ) : (
          // Simple Total Entry (YOUR preferred method!)
          <div className="form-group">
            <label htmlFor="totalTips">Total Tips ($)</label>
            <input
              type="number"
              id="totalTips"
              name="totalTips"
              value={formData.totalTips}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="100"
              required
            />
          </div>
        )}

        {/* Claimed Tips (for taxes) */}
        <div className="form-group">
          <label htmlFor="claimedTips">Claimed Tips ($)</label>
          <input
            type="number"
            id="claimedTips"
            name="claimedTips"
            value={formData.claimedTips}
            onChange={handleChange}
            min="0"
            step="0.01"
            placeholder="100"
            required
          />
          <small className="field-hint">What you're reporting for taxes</small>
        </div>

        {/* Tax Rate */}
        <div className="form-group">
          <label htmlFor="taxRate">Tax Rate (%)</label>
          <input
            type="number"
            id="taxRate"
            name="taxRate"
            value={formData.taxRate}
            onChange={handleChange}
            min="0"
            max="100"
            step="1"
            placeholder="20"
          />
          <small className="field-hint">Percentage to set aside for taxes (default: 20%)</small>
        </div>

        {/* Show calculated tax withholding */}
        {formData.claimedTips && formData.taxRate && (
          <div className="tax-preview">
            💰 Set aside: ${(parseFloat(formData.claimedTips) * parseFloat(formData.taxRate) / 100).toFixed(2)} for taxes
          </div>
        )}

        {/* Notes */}
        <div className="form-group">
          <label htmlFor="notes">Notes (optional)</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Busy Saturday night..."
            rows="3"
          />
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Adding...' : 'Add Shift'}
          </button>
          {onClose && (
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AddShiftForm;

