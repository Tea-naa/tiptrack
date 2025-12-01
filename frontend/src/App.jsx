// App.jsx — The ROOT component that runs your entire TipTrack app
import React, { useState, useEffect } from 'react'; 
import Dashboard from './components/Dashboard';     
import AddShiftForm from './components/AddShiftForm'; 
import ShiftCalendar from './components/ShiftCalendar';  
import { Menu, X, PiggyBank } from 'lucide-react';  
import Login from './components/Login';             

function App() {
  // ======================================
  // 🔹 STATE VARIABLES
  // ======================================

  const [activeTab, setActiveTab] = useState('shifts'); // ✅ CHANGED: Calendar is now default page
  const [user, setUser] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [targetMonth, setTargetMonth] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); 

  // ======================================
  // 🔹 AUTH CHECK ON PAGE LOAD
  // ======================================
  useEffect(() => {
    // Check if user has a token saved in localStorage
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    
    if (token && username) {
      // User was previously logged in - restore their session
      setUser({ username });
    }
    
    setIsCheckingAuth(false); // Done checking
  }, []); // Runs once when app loads

  // ======================================
  // 🔹 SHOW LOADING WHILE CHECKING AUTH
  // ======================================
  if (isCheckingAuth) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <PiggyBank size={48} color="#4ecca3" strokeWidth={2} />
          <p style={{ marginTop: '16px', fontSize: '18px' }}>Loading TipTrack...</p>
        </div>
      </div>
    );
  }

  // ======================================
  // 🔹 SHOW LOGIN IF NOT AUTHENTICATED
  // ======================================
  if (!user) {
    return <Login onLoginSuccess={setUser} />;
  }
  
  // ======================================
  // 🔹 EVENT HANDLERS
  // ======================================

  const handleShiftAdded = () => {
    setRefreshKey(prev => prev + 1);
    setShowAddForm(false);
  };

  const handleShiftDeleted = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleNavigateToMonth = (year, month) => {
    setTargetMonth({ year, month });
    setActiveTab('shifts');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setUser(null);
  };

  // ======================================
  // 🔹 APP STRUCTURE / UI RENDER
  // ======================================

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PiggyBank size={26} color="#4ecca3" strokeWidth={2} />
              <span style={{ fontWeight: 700 }}>TipTrack</span>
            </h1>
            <p className="tagline">Track Your Tips, Plan Your Taxes</p>
          </div>

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
              Calendar
            </button>

            <button
              className="nav-btn logout-btn"
              onClick={handleLogout}
            >
              Logout
            </button>
          </nav>

          <button
            className="btn-add-shift"
            onClick={() => setShowAddForm(true)}
          >
            + Add Shift
          </button>

          <button
            className="mobile-menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

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
            Calendar
          </button>

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

      <main className="app-main">
        <div className="container">
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

      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <AddShiftForm
              onShiftAdded={handleShiftAdded}
              onClose={() => setShowAddForm(false)}
            />
          </div>
        </div>
      )}

      <footer className="app-footer">
        <p>Built by a bartender, for bartenders 🍻</p>
      </footer>
    </div>
  );
}

export default App;