// ShiftCalendar.jsx - Main calendar view showing shifts in a monthly grid
// This component fetches shifts and displays them in a visual calendar format

import React, { useState, useEffect } from 'react';
import { getAllShifts, formatCurrency } from '../services/api';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import DayDetails from './DayDetails';

const ShiftCalendar = ({ refreshTrigger, onDataChanged, targetMonth, onMonthChanged }) => {
  // ==========================================
  // STATE MANAGEMENT
  // ==========================================
  
  // Current month/year being displayed (starts with today's date)
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth()); // 0-11
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear()); // 2025
  
  // All shifts from database
  const [shifts, setShifts] = useState([]);
  
  // Currently selected day (when user clicks a date)
  const [selectedDay, setSelectedDay] = useState(null);
  
  // Loading and error states
  const [loading, setLoading] = useState(true);

  // ==========================================
  // LOAD SHIFTS ON MOUNT & WHEN REFRESH TRIGGERED
  // ==========================================
  useEffect(() => {
    loadShifts();
  }, [refreshTrigger]);

  // ==========================================
  // HANDLE TARGET MONTH NAVIGATION
  // ==========================================
  useEffect(() => {
    if (targetMonth) {
      setCurrentMonth(targetMonth.month - 1); // month is 1-12, state is 0-11
      setCurrentYear(targetMonth.year);
      if (onMonthChanged) onMonthChanged(); // Clear the target
    }
  }, [targetMonth, onMonthChanged]);

  // Fetch all shifts from backend
  const loadShifts = async () => {
    try {
      setLoading(true);
      const data = await getAllShifts();
      setShifts(data);
    } catch (error) {
      console.error('Error loading shifts:', error);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // CALENDAR LOGIC
  // ==========================================
  
  // Get array of month names for display
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Calculate how many days are in current month
  // Example: February 2024 = 29 days (leap year)
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  // Find out what day of week the month starts on (0=Sunday, 6=Saturday)
  // Example: If Nov 1, 2025 is a Friday, this returns 5
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  // ==========================================
  // GROUP SHIFTS BY DATE (TIMEZONE-SAFE)
  // ==========================================
  // This creates an object like: { "2025-11-04": [shift1, shift2], "2025-11-05": [shift3] }
  const shiftsByDate = {};
  shifts.forEach(shift => {
    // FIX: Parse date in local timezone to avoid off-by-one errors
    const date = new Date(shift.date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;
    
    // If this date doesn't exist in our object yet, create an empty array
    if (!shiftsByDate[dateKey]) {
      shiftsByDate[dateKey] = [];
    }
    
    // Add this shift to the array for this date
    shiftsByDate[dateKey].push(shift);
  });

  // ==========================================
  // NAVIGATION HANDLERS
  // ==========================================
  
  // Go to previous month
  const previousMonth = () => {
    if (currentMonth === 0) {
      // If we're in January, go to December of previous year
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      // Otherwise just go back one month
      setCurrentMonth(currentMonth - 1);
    }
  };

  // Go to next month
  const nextMonth = () => {
    if (currentMonth === 11) {
      // If we're in December, go to January of next year
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      // Otherwise just advance one month
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Handle clicking any day (with or without shifts)
  const handleDayClick = (day) => {
    // Create date string in YYYY-MM-DD format
    const month = String(currentMonth + 1).padStart(2, '0'); // "11"
    const dayStr = String(day).padStart(2, '0'); // "04"
    const dateKey = `${currentYear}-${month}-${dayStr}`; // "2025-11-04"
    
    // Always open modal - either show shifts or prompt to add one
    setSelectedDay({ day, dateKey, hasShifts: !!shiftsByDate[dateKey] });
  };

  // ==========================================
  // CALCULATE MONTH SUMMARY
  // ==========================================
  const monthShifts = shifts.filter(shift => {
    const shiftDate = new Date(shift.date);
    return (
      shiftDate.getMonth() === currentMonth &&
      shiftDate.getFullYear() === currentYear
    );
  });

  const monthTotal = monthShifts.reduce((sum, shift) => sum + shift.totalTips, 0);
  const monthClaimed = monthShifts.reduce((sum, shift) => sum + shift.claimedTips, 0);

  // ==========================================
  // RENDER LOADING STATE
  // ==========================================
  if (loading) {
    return (
      <div className="shift-calendar">
        <p>Loading calendar...</p>
      </div>
    );
  }

  // ==========================================
  // RENDER CALENDAR
  // ==========================================
  return (
    <div className="shift-calendar">
      {/* HEADER with month navigation */}
      <div className="calendar-header">
        <h2>
          <Calendar size={24} />
          Shift Calendar
        </h2>
        
        <div className="month-nav">
          <button className="nav-btn" onClick={previousMonth}>
            <ChevronLeft size={20} />
          </button>
          
          <div className="month-display">
            {monthNames[currentMonth]} {currentYear}
          </div>
          
          <button className="nav-btn" onClick={nextMonth}>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* CALENDAR GRID */}
      <div className="calendar-grid">
        {/* Day of week headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="day-header">
            {day}
          </div>
        ))}

        {/* Empty cells before first day of month */}
        {/* Example: If month starts on Friday (5), we need 5 empty cells */}
        {Array(firstDayOfMonth).fill(null).map((_, index) => (
          <div key={`empty-${index}`} className="calendar-day empty" />
        ))}

        {/* Actual days of the month */}
        {Array(daysInMonth).fill(null).map((_, index) => {
          const day = index + 1; // Days are 1-31, not 0-30
          const month = String(currentMonth + 1).padStart(2, '0');
          const dayStr = String(day).padStart(2, '0');
          const dateKey = `${currentYear}-${month}-${dayStr}`;
          
          // Get shifts for this specific day
          const dayShifts = shiftsByDate[dateKey] || [];
          
          // Calculate total tips for this day
          const dayTotal = dayShifts.reduce((sum, shift) => sum + shift.totalTips, 0);
          
          return (
            <div
              key={day}
              className={`calendar-day ${dayShifts.length > 0 ? 'has-shift' : 'no-shift'}`}
              onClick={() => handleDayClick(day)}
              style={{ cursor: 'pointer' }}  // Show all days are clickable
              title={dayShifts.length > 0 ? 'View shifts' : 'Add shift'}
            >
              <div className="day-number">{day}</div>
              {dayShifts.length > 0 && (
                <div className="day-tips">{formatCurrency(dayTotal)}</div>
              )}
            </div>
          );
        })}
      </div>

      {/* MONTH SUMMARY */}
      <div className="calendar-summary">
        <div className="summary-item">
          <span>Shifts:</span>
          <strong>{monthShifts.length}</strong>
        </div>
        <div className="summary-item">
          <span>Total:</span>
          <strong>{formatCurrency(monthTotal)}</strong>
        </div>
        <div className="summary-item">
          <span>Claimed:</span>
          <strong>{formatCurrency(monthClaimed)}</strong>
        </div>
      </div>

      {/* DAY DETAILS MODAL (shows when user clicks a day) */}
      {selectedDay && (
        <div className="modal-overlay" onClick={() => setSelectedDay(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <DayDetails
              day={selectedDay.day}
              month={currentMonth + 1}
              year={currentYear}
              dateKey={selectedDay.dateKey}
              shifts={shiftsByDate[selectedDay.dateKey] || []}
              hasShifts={selectedDay.hasShifts}
              onClose={() => setSelectedDay(null)}
              onShiftUpdated={() => {
                loadShifts();
                if (onDataChanged) onDataChanged();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftCalendar;

// ==========================================
// WHY THIS MATTERS FOR INTERVIEWS:
// ==========================================
// 1. Shows you can work with DATE LOGIC (calculating days in month, first day)
// 2. Demonstrates DATA TRANSFORMATION (grouping shifts by date)
// 3. Shows COMPLEX STATE (current month, selected day, modal state)
// 4. Proves you understand CONDITIONAL RENDERING (empty days, shift days)
// 5. Shows PARENT-CHILD COMMUNICATION (passing callbacks to DayDetails)