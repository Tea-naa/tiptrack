// ==========================================
// MonthlyBreakdown.jsx — Updated with $25K Tax-Free Logic + Yellow Styling
// Appears when user clicks "This Month" card on Dashboard
// ==========================================

import React, { useState, useEffect } from 'react';
import { getAllShifts, formatCurrency } from '../services/api';
import { X, TrendingUp, ChevronRight } from 'lucide-react';

const MonthlyBreakdown = ({ onClose, onMonthClick }) => {
  // ==========================================
  // STATE MANAGEMENT
  // ==========================================
  const [shifts, setShifts] = useState([]); // All shifts from DB
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  // ==========================================
  // LOAD SHIFTS ON MOUNT
  // ==========================================
  useEffect(() => {
    loadShifts();
  }, []);

  const loadShifts = async () => {
    try {
      const data = await getAllShifts();
      setShifts(data);
    } catch (error) {
      console.error('Error loading shifts:', error);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // DATA PROCESSING
  // ==========================================
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Group shifts by year/month → { 2025: { 10: [shifts...], 11: [shifts...] } }
  const shiftsByYearMonth = {};
  shifts.forEach((shift) => {
    const date = new Date(shift.date);
    const year = date.getFullYear();
    const month = date.getMonth(); // 0–11

    if (!shiftsByYearMonth[year]) shiftsByYearMonth[year] = {};
    if (!shiftsByYearMonth[year][month]) shiftsByYearMonth[year][month] = [];

    shiftsByYearMonth[year][month].push(shift);
  });

  // Sort available years descending
  const availableYears = Object.keys(shiftsByYearMonth)
    .map(Number)
    .sort((a, b) => b - a);

  // ==========================================
  // TAX-FREE LOGIC + MONTHLY STATS
  // ==========================================
  const monthsWithData = shiftsByYearMonth[selectedYear] || {};
  const TAX_FREE_THRESHOLD = 25000;

  // Calculate total claimed YTD for the selected year
  const yearClaimedSoFar = Object.values(monthsWithData)
    .flat()
    .reduce((sum, s) => sum + (s.claimedTips || 0), 0);

  // Build data for each month
  const monthData = Object.keys(monthsWithData)
    .map(Number)
    .sort((a, b) => b - a)
    .map((monthIndex) => {
      const monthShifts = monthsWithData[monthIndex];
      const totalTips = monthShifts.reduce((sum, s) => sum + s.totalTips, 0);
      const claimedTips = monthShifts.reduce((sum, s) => sum + s.claimedTips, 0);
      const taxWithholding = monthShifts.reduce(
        (sum, s) => sum + s.taxWithholding,
        0
      );

      //  Apply $25K tax-free rule — only show tax if above threshold
      const displayTax =
        yearClaimedSoFar <= TAX_FREE_THRESHOLD ? 0 : taxWithholding;

      return {
        month: monthIndex,
        name: monthNames[monthIndex],
        shiftCount: monthShifts.length,
        totalTips,
        claimedTips,
        taxWithholding: displayTax,
      };
    });

  // Year summary totals
  const yearTotals = monthData.reduce(
    (acc, m) => ({
      shifts: acc.shifts + m.shiftCount,
      total: acc.total + m.totalTips,
      claimed: acc.claimed + m.claimedTips,
      tax: acc.tax + m.taxWithholding,
    }),
    { shifts: 0, total: 0, claimed: 0, tax: 0 }
  );

  // ==========================================
  // RENDER
  // ==========================================
  if (loading) {
    return <div className="monthly-breakdown"><p>Loading monthly data...</p></div>;
  }

  if (availableYears.length === 0) {
    return (
      <div className="monthly-breakdown">
        <div className="breakdown-header">
          <h2><TrendingUp size={24} /> Monthly Breakdown</h2>
          <button onClick={onClose}><X size={24} /></button>
        </div>
        <p>No shift data available yet.</p>
      </div>
    );
  }

  return (
    <div className="monthly-breakdown">
      {/* ==================== HEADER ==================== */}
      <div className="breakdown-header">
        <h2><TrendingUp size={24} /> Monthly Breakdown</h2>
        <button onClick={onClose}><X size={24} /></button>
      </div>

      {/* ==================== YEAR SELECTOR ==================== */}
      <div className="year-selector">
        <label>Select Year:</label>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
        >
          {availableYears.map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {/* ==================== TABLE (Desktop) ==================== */}
      <div className="breakdown-table-container">
        <table className="breakdown-table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Shifts</th>
              <th>Total Tips</th>
              <th>Claimed</th>
              <th>Tax Withheld</th>
            </tr>
          </thead>
          <tbody>
            {monthData.map((month) => (
              <tr
                key={month.month}
                className="clickable-row"
                onClick={() => onMonthClick(selectedYear, month.month + 1)}
              >
                <td>{month.name}</td>
                <td>{month.shiftCount}</td>
                <td className="amount">{formatCurrency(month.totalTips)}</td>
                <td className="amount">{formatCurrency(month.claimedTips)}</td>

                {/*  Show yellow text if under threshold */}
                <td className="amount tax">
                  {yearClaimedSoFar <= TAX_FREE_THRESHOLD ? (
                    <span className="tax-free-text">Tax-Free Zone </span>
                  ) : (
                    formatCurrency(month.taxWithholding)
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ==================== MOBILE CARDS ==================== */}
      <div className="breakdown-cards">
        {monthData.map((month) => (
          <div
            key={month.month}
            className="month-card"
            onClick={() => onMonthClick(selectedYear, month.month + 1)}
          >
            <div className="month-card-header">
              <div className="month-card-title">
                <ChevronRight size={18} /> {month.name}
              </div>
              <div className="month-card-shifts">
                {month.shiftCount} {month.shiftCount === 1 ? 'shift' : 'shifts'}
              </div>
            </div>

            <div className="month-card-stats">
              <div className="month-stat">
                <span className="month-stat-label">Total Tips</span>
                <span className="month-stat-value highlight">
                  {formatCurrency(month.totalTips)}
                </span>
              </div>
              <div className="month-stat">
                <span className="month-stat-label">Claimed</span>
                <span className="month-stat-value">
                  {formatCurrency(month.claimedTips)}
                </span>
              </div>

              {/*  Yellow “Tax-Free” or normal tax */}
              <div className="month-stat">
                <span className="month-stat-label">Tax (Set Aside)</span>
                <span className="month-stat-value tax">
                  {yearClaimedSoFar <= TAX_FREE_THRESHOLD ? (
                    <span className="tax-free-text">Tax-Free Zone </span>
                  ) : (
                    formatCurrency(month.taxWithholding)
                  )}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ==================== YEAR SUMMARY ==================== */}
      <div className="year-summary">
        <h3>{selectedYear} Summary</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <span className="label">Total Shifts</span>
            <span className="value">{yearTotals.shifts}</span>
          </div>
          <div className="summary-item">
            <span className="label">Total Tips</span>
            <span className="value highlight">
              {formatCurrency(yearTotals.total)}
            </span>
          </div>
          <div className="summary-item">
            <span className="label">Claimed</span>
            <span className="value">{formatCurrency(yearTotals.claimed)}</span>
          </div>
          <div className="summary-item">
            <span className="label">Tax Withheld</span>
            <span className="value">
              {yearClaimedSoFar <= TAX_FREE_THRESHOLD ? (
                <span className="tax-free-text">Tax-Free Zone </span>
              ) : (
                formatCurrency(yearTotals.tax)
              )}
            </span>
          </div>
        </div>
      </div>

      <p className="helper-text"> Click any month to view detailed calendar</p>
    </div>
  );
};

export default MonthlyBreakdown;


