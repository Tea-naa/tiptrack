// API Service - All backend communication with JWT authentication
import axios from 'axios';

// =======================
// BASE URLS
// =======================

const API_BASE_URL = 'https://tiptrack-production-c832.up.railway.app/api/shifts';

// Auth API URL - removes '/shifts' from the end to get the base /api path
// Example: https://railway.app/api/shifts → https://railway.app/api
const AUTH_BASE_URL = API_BASE_URL.replace('/shifts', '');

// Debug logs to verify URLs in browser console
console.log('🚀 API Base URL:', API_BASE_URL);
console.log('🔐 Auth Base URL:', AUTH_BASE_URL);

// =======================
// AXIOS INSTANCES
// =======================

// Create axios instance for SHIFTS routes (/api/shifts/...)
const api = axios.create({
  baseURL: API_BASE_URL,  // Points to /api/shifts
  headers: {
    'Content-Type': 'application/json'
  }
});

// Create axios instance for AUTH routes (/api/auth/...)
const authApi = axios.create({
  baseURL: AUTH_BASE_URL,  // Points to /api (not /api/shifts)
  headers: {
    'Content-Type': 'application/json'
  }
});

// =======================
// INTERCEPTORS
// =======================

// Add JWT token to EVERY shift request automatically
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add JWT token to EVERY auth request automatically
authApi.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// =======================
// AUTH API FUNCTIONS (NEW!)
// =======================

// Login function - calls /api/auth/login
export const login = async (email, password) => {
  try {
    // authApi has baseURL of /api, so this becomes /api/auth/login
    const response = await authApi.post('/auth/login', { email, password });
    
    // Save the JWT token to localStorage for future requests
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Register function - calls /api/auth/register
export const register = async (name, email, password) => {
  try {
    // authApi has baseURL of /api, so this becomes /api/auth/register
    const response = await authApi.post('/auth/register', { name, email, password });
    
    // Save the JWT token to localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    
    return response.data;
  } catch (error) {
    console.error('Register error:', error);
    throw error;
  }
};

// Logout function - clears the JWT token from localStorage
export const logout = () => {
  localStorage.removeItem('token');
};

// =======================
// SHIFTS API FUNCTIONS
// =======================

// Get all shifts for logged-in user
// Calls: GET /api/shifts
export const getAllShifts = async () => {
  try {
    // api.get('') goes to baseURL which is /api/shifts
    const response = await api.get('');
    return response.data;
  } catch (error) {
    console.error('Error fetching shifts:', error);
    throw error;
  }
};

// Get one shift by ID
// Calls: GET /api/shifts/:id
export const getShiftById = async (id) => {
  try {
    // api.get('123') becomes /api/shifts/123
    const response = await api.get(`${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching shift:', error);
    throw error;
  }
};

// Create a new shift
// Calls: POST /api/shifts
export const createShift = async (shiftData) => {
  try {
    // api.post('', data) goes to /api/shifts
    const response = await api.post('', shiftData);
    return response.data;
  } catch (error) {
    console.error('Error creating shift:', error);
    throw error;
  }
};

// Update an existing shift
// Calls: PUT /api/shifts/:id
export const updateShift = async (id, shiftData) => {
  try {
    // api.put('123', data) becomes /api/shifts/123
    const response = await api.put(`${id}`, shiftData);
    return response.data;
  } catch (error) {
    console.error('Error updating shift:', error);
    throw error;
  }
};

// Delete a shift
// Calls: DELETE /api/shifts/:id
export const deleteShift = async (id) => {
  try {
    // api.delete('123') becomes /api/shifts/123
    const response = await api.delete(`${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting shift:', error);
    throw error;
  }
};

// Get statistics summary
// Calls: GET /api/shifts/stats/summary
export const getStats = async () => {
  try {
    // api.get('stats/summary') becomes /api/shifts/stats/summary
    const response = await api.get('stats/summary');
    return response.data;
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw error;
  }
};

// =======================
// HELPER FUNCTIONS
// =======================

// Format a number as US currency ($1,234.56)
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// Format ISO date string to readable format (Jan 15, 2024)
export const formatDate = (dateString) => {
  const datePart = dateString.split('T')[0];
  const [year, month, day] = datePart.split('-');
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Format date for HTML input field (YYYY-MM-DD)
export const formatDateForInput = (dateString) => {
  // If already in correct format, return as-is
  if (typeof dateString === 'string' && dateString.length === 10 && !dateString.includes('T')) {
    return dateString;
  }
  
  const dateStr = String(dateString);
  
  // If ISO format, extract date part
  if (dateStr.includes('T')) {
    return dateStr.split('T')[0];
  }
  
  // Otherwise, parse and format
  const d = new Date(dateString);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Format date for backend (full ISO string)
export const formatDateForBackend = (dateString) => {
  // If already has time component, return as-is
  if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return `${dateString}T12:00:00.000Z`;
  }
  
  if (typeof dateString === 'string' && dateString.includes('T')) {
    return dateString;
  }
  
  return new Date(dateString).toISOString();
};