// EditShiftModal Component
// Modal for editing an existing shift
// Similar to AddShiftForm but pre-filled with existing data

import React, { useState } from 'react';
import { updateShift, formatDateForInput, formatDateForBackend } from '../services/api';  // ← ADD formatDateForBackend
import { Edit, X } from 'lucide-react';

const EditShiftModal = ({ shift, onShiftUpdated, onClose }) => {
  // Pre-fill form with existing shift data
  const [formData, setFormData] = useState({
    date: formatDateForInput(shift.date),
    hoursWorked: shift.hoursWorked,
    totalTips: shift.totalTips,
    cashTips: shift.cashTips || '',
    creditTips: shift.creditTips || '',
    claimedTips: shift.claimedTips,
    taxRate: shift.taxRate,
    notes: shift.notes || '',
  });

  const [useSeparateEntry, setUseSeparateEntry] = useState(shift.cashTips > 0 || shift.creditTips > 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);

      const shiftData = {
        date: formatDateForBackend(formData.date),  // ← FIX: Convert date properly
        hoursWorked: parseFloat(formData.hoursWorked),
        claimedTips: parseFloat(formData.claimedTips),
        taxRate: parseFloat(formData.taxRate),
        notes: formData.notes,
      };

      if (useSeparateEntry) {
        shiftData.cashTips = parseFloat(formData.cashTips) || 0;
        shiftData.creditTips = parseFloat(formData.creditTips) || 0;
        shiftData.totalTips = shiftData.cashTips + shiftData.creditTips;
      } else {
        shiftData.totalTips = parseFloat(formData.totalTips);
        shiftData.cashTips = 0;
        shiftData.creditTips = 0;
      }

      await updateShift(shift._id, shiftData);
      onShiftUpdated(); // triggers Dashboard + ShiftList refresh
      onClose();
      
    } catch (err) {
      setError('Failed to update shift. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-shift-form">
      <div className="form-header">
        <h3><Edit size={20} /> Edit Shift</h3>
        <button className="close-btn" onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
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
            required
          />
        </div>

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

        {useSeparateEntry ? (
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
                  required
                />
              </div>
            </div>

            {formData.cashTips && formData.creditTips && (
              <div className="calculated-total">
                Total Tips: ${(parseFloat(formData.cashTips) + parseFloat(formData.creditTips)).toFixed(2)}
              </div>
            )}
          </>
        ) : (
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
              required
            />
          </div>
        )}

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
            required
          />
          <small className="field-hint">What you're reporting for taxes</small>
        </div>

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
          />
          <small className="field-hint">Percentage to set aside for taxes</small>
        </div>

        {formData.claimedTips && formData.taxRate && (
          <div className="tax-preview">
            💰 Set aside: ${(parseFloat(formData.claimedTips) * parseFloat(formData.taxRate) / 100).toFixed(2)} for taxes
          </div>
        )}

        <div className="form-group">
          <label htmlFor="notes">Notes (optional)</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Notes about this shift..."
            rows="3"
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Updating...' : 'Update Shift'}
          </button>
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditShiftModal;