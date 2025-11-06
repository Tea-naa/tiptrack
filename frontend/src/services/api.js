// API Service - All backend communication happens here
// This keeps your components clean and organized

import axios from 'axios';

// Base URL for your backend
// Change this to match your backend port (5000 or 5001)
// This lets Docker set a different URL while keeping localhost for dev.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/shifts';
// =======================
// API FUNCTIONS
// =======================

// 1. Get all shifts
// Returns: Array of shift objects
export const getAllShifts = async () => {
  try {
    const response = await axios.get(API_BASE_URL);
    return response.data;  // Array of shifts
  } catch (error) {
    console.error('Error fetching shifts:', error);
    throw error;  // Re-throw so component can handle it
  }
};

// 2. Get one shift by ID
// Parameters: id (string)
// Returns: Single shift object
export const getShiftById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching shift:', error);
    throw error;
  }
};

// 3. Create new shift
// Parameters: shiftData (object with date, hoursWorked, totalTips, etc.)
// Returns: Created shift object
export const createShift = async (shiftData) => {
  try {
    const response = await axios.post(API_BASE_URL, shiftData);
    return response.data;
  } catch (error) {
    console.error('Error creating shift:', error);
    throw error;
  }
};

// 4. Update existing shift
// Parameters: id (string), shiftData (object)
// Returns: Updated shift object
export const updateShift = async (id, shiftData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/${id}`, shiftData);
    return response.data;
  } catch (error) {
    console.error('Error updating shift:', error);
    throw error;
  }
};

// 5. Delete shift
// Parameters: id (string)
// Returns: Success message
export const deleteShift = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting shift:', error);
    throw error;
  }
};

// 6. Get dashboard statistics
// Returns: Object with today, week, month totals + tax info
export const getStats = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/stats/summary`);
    return response.data;
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw error;
  }
};

// =======================
// HELPER FUNCTIONS
// =======================

// Format currency (for display)
// Example: 123.45 → "$123.45"
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// Format date for display
// Example: "2025-11-04T00:00:00.000Z" → "Nov 4, 2025"
export const formatDate = (dateString) => {
  // Extract just the date part (before the 'T')
  const datePart = dateString.split('T')[0];  // "2025-11-04"
  
  // Split into year, month, day
  const [year, month, day] = datePart.split('-');
  
  // Create date in LOCAL timezone (not UTC)
  const date = new Date(year, month - 1, day);
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Format date for input field (for <input type="date">)
// Example: "2025-11-01T00:00:00.000Z" → "2025-11-01"
export const formatDateForInput = (dateString) => {
  // If it's already a simple date string (YYYY-MM-DD), return as-is
  if (typeof dateString === 'string' && dateString.length === 10 && !dateString.includes('T')) {
    return dateString;
  }
  
  // If it's an ISO string from MongoDB, extract just the date part
  const dateStr = String(dateString);
  if (dateStr.includes('T')) {
    return dateStr.split('T')[0];  // "2025-11-01T00:00:00.000Z" → "2025-11-01"
  }
  
  // Fallback: If it's a Date object, convert to local date
  const d = new Date(dateString);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Format date for backend (ensures consistent timezone handling)
// Converts "2025-11-01" to ISO string at noon UTC to avoid timezone shifts
// Example: "2025-11-01" → "2025-11-01T12:00:00.000Z"
export const formatDateForBackend = (dateString) => {
  // If dateString is already in YYYY-MM-DD format (from input type="date")
  if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    // Create date at noon UTC to avoid timezone boundary issues
    return `${dateString}T12:00:00.000Z`;
  }
  
  // If it's already a full ISO string, return as-is
  if (typeof dateString === 'string' && dateString.includes('T')) {
    return dateString;
  }
  
  // Fallback: convert to ISO string
  return new Date(dateString).toISOString();
};