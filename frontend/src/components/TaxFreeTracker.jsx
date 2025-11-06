// Shows user's progress toward the $25,000 tax-free tip threshold
import React from 'react';
import { PiggyBank, TrendingUp, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../services/api';

const TaxFreeTracker = ({ yearToDateClaimed, taxRate }) => {
  // CONSTANTS
  const TAX_FREE_THRESHOLD = 25000;
  
  // CALCULATIONS
  const percentUsed = Math.min((yearToDateClaimed / TAX_FREE_THRESHOLD) * 100, 100);
  const remaining = Math.max(TAX_FREE_THRESHOLD - yearToDateClaimed, 0);
  const taxableAmount = Math.max(yearToDateClaimed - TAX_FREE_THRESHOLD, 0);
  const actualTaxOwed = taxableAmount * (taxRate / 100);
  
  // STATUS
  const isUnderThreshold = yearToDateClaimed < TAX_FREE_THRESHOLD;
  const isNearThreshold = yearToDateClaimed >= TAX_FREE_THRESHOLD * 0.9 && isUnderThreshold;
  
  return (
    <div className="tax-free-tracker">
      <div className="tracker-header">
        <h3>
          <PiggyBank size={24} />
          Tax-Free Tip Tracker (2025)
        </h3>
        <div className="info-icon" title="First $25,000 in claimed tips is tax-free!">
          <AlertCircle size={18} />
        </div>
      </div>

      <div className="progress-container">
        <div className="progress-bar">
          <div 
            className={`progress-fill ${!isUnderThreshold ? 'over-threshold' : ''}`}
            style={{ width: `${percentUsed}%` }}
          >
            {percentUsed > 10 && (
              <span className="progress-text">
                {percentUsed.toFixed(0)}%
              </span>
            )}
          </div>
        </div>
        
        <div className="progress-labels">
          <span className="current-amount">
            {formatCurrency(yearToDateClaimed)}
          </span>
          <span className="threshold-amount">
            / {formatCurrency(TAX_FREE_THRESHOLD)}
          </span>
        </div>
      </div>

      <div className="tracker-status">
        {isUnderThreshold ? (
          <>
            <div className={`status-message ${isNearThreshold ? 'warning' : 'success'}`}>
              {isNearThreshold ? (
                <>
                  <TrendingUp size={20} />
                  <span>
                    You're close! {formatCurrency(remaining)} left before taxes apply
                  </span>
                </>
              ) : (
                <>
                  <TrendingUp size={20} />
                  <span>
                    You're still in the tax-free zone! {formatCurrency(remaining)} remaining
                  </span>
                </>
              )}
            </div>
            
            <div className="tax-info">
              <span className="label">Tax Owed (Year to Date):</span>
              <span className="amount success">{formatCurrency(0)}</span>
            </div>
          </>
        ) : (
          <>
            <div className="status-message over">
              <AlertCircle size={20} />
              <span>
                You've claimed {formatCurrency(yearToDateClaimed)} this year
              </span>
            </div>
            
            <div className="tax-breakdown">
              <div className="breakdown-item">
                <span className="label">Tax-Free:</span>
                <span className="amount">{formatCurrency(TAX_FREE_THRESHOLD)}</span>
              </div>
              <div className="breakdown-item taxable">
                <span className="label">Taxable Amount:</span>
                <span className="amount">{formatCurrency(taxableAmount)}</span>
              </div>
              <div className="breakdown-item total">
                <span className="label">💰 Total Tax Owed ({taxRate}%):</span>
                <span className="amount highlight">{formatCurrency(actualTaxOwed)}</span>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="tracker-info">
        <p className="info-text">
          Under current law, the first $25,000 in claimed tips is tax-free. 
          You only pay taxes on amounts exceeding this threshold.
        </p>
      </div>
    </div>
  );
};

export default TaxFreeTracker;