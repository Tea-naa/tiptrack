// =======================
// LOGIN COMPONENT – PILL → PANEL
// =======================
import { useState } from "react";
import { Eye, EyeOff, PiggyBank } from "lucide-react";
import "../styles/Login.css";
import { login, register } from "../services/api";  

function Login({ onLoginSuccess }) {
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(false);

  // ✅ UPDATED THIS ENTIRE FUNCTION
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      // Use the login/register functions from api.js instead of fetch
      const data = isSignup 
        ? await register(username, username, password)  // name, email, password
        : await login(username, password);  // email, password

      // Store user info
      localStorage.setItem("username", data.user.username);
      
      // Call success callback
      onLoginSuccess(data.user);
      
    } catch (err) {
      // Display error message to user
      setError(err.response?.data?.message || err.message || "Login failed");
    }
  };

  return (
    <div className="login-container">
      {/* Floating glows */}
      <div className="login-bg-circle login-bg-circle-1"></div>
      <div className="login-bg-circle login-bg-circle-2"></div>
      <div className="login-bg-circle login-bg-circle-3"></div>

      {/* Main card */}
      <div
        className={`login-card ${expanded ? "expanded" : "collapsed"}`}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      >
        {/* Animated border */}
        <div className="login-card-border"></div>

        {/* ======================= */}
        {/* COMPACT STATE (Pill)    */}
        {/* ======================= */}
        
        {!expanded && (
          <div className="login-compact">
            <h1 className="compact-title">Login</h1>

            {/* bottom-right tiny badge */}
            <div className="login-brand-badge compact-brand">
              <PiggyBank size={14} color="#4ecca3" strokeWidth={2} />
              <span>TipTrack</span>
            </div>
          </div>
        )}

        {/* ======================= */}
        {/* EXPANDED LOGIN PANEL    */}
        {/* ======================= */}
        {expanded && (
          <div className="login-inner">
            <header className="login-header">
              <div className="header-brand">
                <PiggyBank size={35} color="#4ecca3" strokeWidth={2} />
                <h1>TipTrack</h1>
              </div>
              <p className="header-subtext">Track your tips, plan your taxes.</p>
            </header>

            {/* Form */}
            <form className="login-form" onSubmit={handleSubmit}>
              <div className="login-input-group">
                <input
                  className="login-input"
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div className="login-input-group">
                <input
                  className="login-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="login-eye-button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <button className="login-button" type="submit">
                <span>{isSignup ? "SIGN UP" : "SIGN IN"}</span>
              </button>
            </form>

            {/* Toggle between Login / Signup */}
            <div className="login-footer">
              <span>
                {isSignup
                  ? "Already have an account?"
                  : "Don't have an account?"}
              </span>
              <button
                className="login-toggle"
                type="button"
                onClick={() => setIsSignup(!isSignup)}
              >
                {isSignup ? "Login" : "Sign Up"}
              </button>
            </div>

            {error && <p className="login-error">{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;