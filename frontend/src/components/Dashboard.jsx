// Dashboard.jsx — Displays your earnings summary + tax info
// This component fetches shift data from the backend and shows
// stats for Today, This Week, This Month, and tax estimates.

import React, { useState, useEffect } from 'react';
import StatsCard from './StatsCard';
import TaxFreeTracker from './TaxFreeTracker';  
import MonthlyBreakdown from './MonthlyBreakdown';  
import { getStats, formatCurrency } from '../services/api';
import { DollarSign, TrendingUp, Calendar, PiggyBank } from 'lucide-react';

const Dashboard = ({ refreshTrigger, onNavigateToMonth }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMonthlyBreakdown, setShowMonthlyBreakdown] = useState(false);  

  // Load data whenever the dashboard refresh trigger changes
  useEffect(() => {
    loadStats();
  }, [refreshTrigger]);

  // Fetch dashboard stats from backend
  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await getStats();
      setStats(data);
      setError(null);
    } catch (err) {
      setError('Failed to load statistics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Show loading indicator while fetching
  if (loading) {
    return (
      <div className="dashboard">
        <h2>Dashboard</h2>
        <p>Loading statistics...</p>
      </div>
    );
  }

  // Show error message if something went wrong
  if (error) {
    return (
      <div className="dashboard">
        <h2>Dashboard</h2>
        <p className="error-message">{error}</p>
        <button onClick={loadStats}>Retry</button>
      </div>
    );
  }

  // Handle no data case
  if (!stats || stats.totalShifts === 0) {
    return (
      <div className="dashboard">
        <h2>Dashboard</h2>
        <p className="empty-state">
          No shifts recorded yet. Add your first shift to see stats!
        </p>
      </div>
    );
  }

  // Fallback for total income if backend hasn't added it yet
  const totalIncome = stats.totalIncome || (stats.average * stats.totalShifts);

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      
      {/* EARNINGS SECTION */}
      <div className="stats-grid">
        {/* Today's Earnings */}
        <StatsCard
          title="Today's Earnings"
          value={stats.today}
          subtitle={`Claimed: ${formatCurrency(stats.todayClaimed)}`}
          icon={<DollarSign />}
        />

        {/* This Week */}
        <StatsCard
          title="This Week"
          value={stats.week}
          subtitle={`Claimed: ${formatCurrency(stats.weekClaimed)}`}
          icon={<TrendingUp />}
        />

        {/* This Month -  CLICKABLE! */}
        <div 
          onClick={() => setShowMonthlyBreakdown(true)} 
          style={{ cursor: 'pointer' }}
          title="Click to view monthly breakdown"
        >
          <StatsCard
            title="This Month →"
            value={stats.month}
            subtitle={`Claimed: ${formatCurrency(stats.monthClaimed)}`}
            icon={<Calendar />}
          />
        </div>

        {/*  Total Income */}
        <StatsCard
          title="Total Income"
          value={totalIncome}
          subtitle={`Based on ${stats.totalShifts} shifts`}
          icon={<PiggyBank />}
        />
      </div>

      {/* TAX-FREE TIP TRACKER */}
      <TaxFreeTracker 
        yearToDateClaimed={stats.yearToDateClaimed}
        taxRate={stats.averageTaxRate || 20}
      />

      {/* TAX WITHHOLDING SECTION */}
      <div className="tax-section">
        <h3><PiggyBank size={24} /> Tax Withholding</h3>
        <p className="tax-description">
          Money you should set aside for taxes (only on amounts over $25,000)
        </p>
        
        <div className="tax-grid">
          <div className="tax-item">
            <span className="tax-label">Today:</span>
            <span className="tax-amount">{formatCurrency(stats.todayTax)}</span>
          </div>
          <div className="tax-item">
            <span className="tax-label">This Week:</span>
            <span className="tax-amount">{formatCurrency(stats.weekTax)}</span>
          </div>
          <div className="tax-item">
            <span className="tax-label">This Month:</span>
            <span className="tax-amount highlight">{formatCurrency(stats.monthTax)}</span>
          </div>
        </div>
      </div>

      {/* ========================================= */}
      {/* MONTHLY BREAKDOWN MODAL          */}
      {/* ========================================= */}
      {showMonthlyBreakdown && (
        <div 
          className="modal-overlay" 
          onClick={() => setShowMonthlyBreakdown(false)}
        >
          <div 
            className="modal-content modal-large" 
            onClick={(e) => e.stopPropagation()}
          >
            <MonthlyBreakdown 
              onClose={() => setShowMonthlyBreakdown(false)}
              onMonthClick={(year, month) => {
                // Navigate to calendar showing this specific month
                setShowMonthlyBreakdown(false);
                if (onNavigateToMonth) {
                  onNavigateToMonth(year, month);
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

// ==========================================
// WHAT CHANGED:
// ==========================================
// 
// 1. Added import for MonthlyBreakdown component
// 2. Added state: showMonthlyBreakdown (controls modal visibility)
// 3. Wrapped "This Month" StatsCard in clickable div
// 4. Changed title to "This Month →" (arrow indicates clickable)
// 5. Added modal at bottom that shows when state is true
//
// HOW IT WORKS:
// - User clicks "This Month" card
// - setShowMonthlyBreakdown(true) runs
// - React re-renders with modal visible
// - MonthlyBreakdown fetches all shifts and groups by month
// - User sees table with all past months
// - Clicking X or outside closes modal
//
// WHY THE ARROW (→)?
// - Visual cue that the card is interactive
// - Common UX pattern for "click to see more"
//
// WHY stopPropagation()?
// - Clicking inside modal shouldn't close it
// - Only clicking the dark overlay should close
// - Without this, any click closes the modal
//
// INTERVIEW TALKING POINT:
// "I made the card clickable by wrapping it in a div with onClick.
// The modal uses a common pattern: overlay + content box.
// stopPropagation prevents clicks inside the modal from bubbling
// up to the overlay's onClick handler."
// 
