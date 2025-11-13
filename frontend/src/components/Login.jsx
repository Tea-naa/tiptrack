// =======================
// LOGIN COMPONENT - CLEAN VERSION
// =======================
import { useState } from 'react';
import { Eye, EyeOff, PiggyBank } from 'lucide-react';
import '../styles/Login.css';

function Login({ onLoginSuccess }) {  
  
  // State
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if(!username || !password){
        setError('Please fill in all fields');
        return;
    }
    
    const endpoint = isSignup ? '/api/auth/signup' : '/api/auth/login';
    
    try {
      const response = await fetch(`http://localhost:5001${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();

      if (!response.ok){
        throw new Error(data.message || 'Something went wrong');
      }
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.user.username);
      onLoginSuccess(data.user);
      
    } catch (err) {
      setError(err.message);
      console.error('Auth error:', err);
    }
  };
  
  return (
    <div className="login-container">
      {/* Animated background circles */}
      <div className="login-bg-circle login-bg-circle-1"></div>
      <div className="login-bg-circle login-bg-circle-2"></div>
      <div className="login-bg-circle login-bg-circle-3"></div>
      
      <div className="login-card">
        {/* Animated border */}
        <div className="login-card-border"></div>
        
        {/* TipTrack Logo */}
        <div className="login-logo">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
            <PiggyBank size={40} color="#4ecca3" strokeWidth={2} />
            <span style={{ fontWeight: 700, fontSize: '2rem', color: '#fff' }}>TipTrack</span>
          </h1>
          <p className="tagline" style={{ color: '#a0a0a0', fontSize: '0.95rem', marginTop: '8px' }}>
            Track Your Tips, Plan Your Taxes
          </p>
        </div>
        
        {/* Form */}
        <form className="login-form" onSubmit={handleSubmit}>
          {/* Username Input */}
          <div className="login-input-group">
            <input 
              className="login-input"
              type="text" 
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          
          {/* Password Input with Eye Icon */}
          <div className="login-input-group">
            <input 
              className="login-input"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {/* Eye icon button */}
            <button 
              type="button"
              className="login-eye-button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          
          {/* Submit Button */}
          <button className="login-button" type="submit">
            <span>{isSignup ? 'SIGN UP' : 'SIGN IN'}</span>
          </button>
        </form>
        
        {/* Toggle Signup/Login */}
        <div className="login-footer">
          <span>{isSignup ? 'Already have an account?' : "Don't have an account?"}</span>
          <button className="login-toggle" onClick={() => setIsSignup(!isSignup)}>
            {isSignup ? 'Login' : 'Sign Up'}
          </button>
        </div>
        
        {/* Error Message */}
        {error && <p className="login-error">{error}</p>}
        
      </div>
    </div>
  );
}  

export default Login;