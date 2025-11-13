// App.jsx — The ROOT component that runs your entire TipTrack app
// Controls navigation, renders Dashboard or ShiftList, and opens the Add Shift form

import React, { useState } from 'react';
import Dashboard from './components/Dashboard';     
import AddShiftForm from './components/AddShiftForm'; 
import ShiftCalendar from './components/ShiftCalendar';  
import { Menu, X, PiggyBank } from 'lucide-react';  
import Login from './components/Login';             

function App() {
  // ======================================
  // 🔹 STATE VARIABLES
  // ======================================

  // Controls which page is active: "dashboard" or "shifts"
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Track logged-in user (null = not logged in)
  const [user, setUser] = useState(null);

  // Controls visibility of the Add Shift modal form
  const [showAddForm, setShowAddForm] = useState(false);

  // Used to trigger a refresh in child components (Dashboard / ShiftCalendar)
  // Each time we increment this number, the children re-fetch their data
  const [refreshKey, setRefreshKey] = useState(0);

  // Controls whether the mobile menu is open or closed
  const [menuOpen, setMenuOpen] = useState(false);

  // Target month for calendar navigation (null = current month)
  const [targetMonth, setTargetMonth] = useState(null);


  // ======================================
  // 🔹 AUTH CHECK
  // ======================================
  // If user is not logged in, show login page
  if (!user) {
    return <Login onLoginSuccess={setUser} />;
  }
  
  // ======================================
  // 🔹 EVENT HANDLERS
  // ======================================

  // Called after a new shift is successfully added
  const handleShiftAdded = () => {
    setRefreshKey(prev => prev + 1); // forces Dashboard + ShiftList to refresh their data
    setShowAddForm(false);           // closes the Add Shift modal
  };

  // Called after a shift is deleted from ShiftCalendar
  const handleShiftDeleted = () => {
    setRefreshKey(prev => prev + 1); // triggers a re-fetch just like when adding a shift
  };

  // Navigate to specific month in calendar (called from Dashboard)
  const handleNavigateToMonth = (year, month) => {
    setTargetMonth({ year, month }); // Set target month
    setActiveTab('shifts'); // Switch to calendar view
  };

  // Logout handler - clears tokens and returns to login page
  const handleLogout = () => {
    localStorage.removeItem('token');       // Remove JWT token from browser
    localStorage.removeItem('username');    // Remove username from browser
    setUser(null);                          // Clear user state (triggers login page)
  };

  // ======================================
  // 🔹 APP STRUCTURE / UI RENDER
  // ======================================

  return (
    <div className="app">
      {/* ===================== */}
      {/* HEADER / NAVIGATION BAR */}
      {/* ===================== */}
      <header className="app-header">
        <div className="header-content">

          {/* ─── LOGO ─── */}
          <div className="logo">
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PiggyBank size={26} color="#4ecca3" strokeWidth={2} />
              <span style={{ fontWeight: 700 }}>TipTrack</span>
            </h1>
            <p className="tagline">Track Your Tips, Plan Your Taxes</p>
          </div>

          {/* ─── DESKTOP NAV LINKS (hidden on mobile) ─── */}
          <nav className="nav desktop-nav">
            <button
              className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('dashboard');
                setRefreshKey(prev => prev + 1);
              }}
            >
              Dashboard
            </button>

            <button
              className={`nav-btn ${activeTab === 'shifts' ? 'active' : ''}`}
              onClick={() => setActiveTab('shifts')}
            >
              All Shifts
            </button>

            {/* ─── LOGOUT BUTTON ─── */}
            <button
              className="nav-btn logout-btn"
              onClick={handleLogout}
            >
              Logout
            </button>
          </nav>

          {/* ─── + ADD SHIFT BUTTON (always visible) ─── */}
          <button
            className="btn-add-shift"
            onClick={() => setShowAddForm(true)}
          >
            + Add Shift
          </button>

          {/* ─── MOBILE MENU TOGGLE (visible only on ≤768px) ─── */}
          <button
            className="mobile-menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* ─── MOBILE SLIDE-IN MENU ─── */}
        <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
          <button
            className={`mobile-menu-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('dashboard');
              setMenuOpen(false);
              setRefreshKey(prev => prev + 1);
            }}
          >
            Dashboard
          </button>

          <button
            className={`mobile-menu-item ${activeTab === 'shifts' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('shifts');
              setMenuOpen(false);
            }}
          >
            All Shifts
          </button>

          {/* ─── LOGOUT BUTTON (mobile menu) ─── */}
          <button
            className="mobile-menu-item logout-btn"
            onClick={() => {
              handleLogout();
              setMenuOpen(false);
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* ===================== */}
      {/* MAIN CONTENT AREA */}
      {/* ===================== */}
      <main className="app-main">
        <div className="container">
          {/* Render Dashboard or ShiftCalendar depending on activeTab */}
          {activeTab === 'dashboard' && (
            <Dashboard 
              refreshTrigger={refreshKey}
              onNavigateToMonth={handleNavigateToMonth}
            />
          )}
          
          {activeTab === 'shifts' && (
            <ShiftCalendar 
              refreshTrigger={refreshKey}
              onDataChanged={() => setRefreshKey(prev => prev + 1)}
              targetMonth={targetMonth}
              onMonthChanged={() => setTargetMonth(null)}
            />
          )}
        </div>
      </main>

      {/* ===================== */}
      {/* ADD SHIFT MODAL POPUP */}
      {/* ===================== */}
      {showAddForm && (
        // Overlay background (clicking outside closes modal)
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          {/* Modal content container (stops click from closing modal) */}
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <AddShiftForm
              onShiftAdded={handleShiftAdded}         // runs after successful form submit
              onClose={() => setShowAddForm(false)}   // closes modal manually
            />
          </div>
        </div>
      )}

      {/* ===================== */}
      {/* FOOTER */}
      {/* ===================== */}
      <footer className="app-footer">
        <p>Built by a bartender, for bartenders 🍻</p>
      </footer>
    </div>
  );
}

export default App;


// HOW THIS APP WORKS:
// 1. App.jsx checks if user is logged in (if not, shows Login component)
// 2. Once logged in, renders Dashboard OR ShiftCalendar based on activeTab
// 3. User clicks "Add Shift" → modal opens with AddShiftForm
// 4. User submits form → handleShiftAdded() runs
// 5. refreshKey increments → triggers re-fetch in Dashboard and ShiftList
// 6. Data refreshes automatically!
// 7. User clicks "Logout" → clears tokens → returns to login page

// DETAILED FLOW:
// - User logs in → JWT token saved in localStorage
// - The backend saves new shifts to MongoDB
// - handleShiftAdded() increments refreshKey
// - React re-renders Dashboard and ShiftCalendar
// - Both components call their APIs again to fetch the latest data
// - The user instantly sees updated totals, averages, and tax info
// - Logout clears localStorage and resets user state