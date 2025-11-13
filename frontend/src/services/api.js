// API Service - All backend communication with JWT authentication
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/shifts';

// Create axios instance with auth interceptor
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add JWT token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// =======================
// API FUNCTIONS
// =======================

export const getAllShifts = async () => {
  try {
    const response = await api.get('/');
    return response.data;
  } catch (error) {
    console.error('Error fetching shifts:', error);
    throw error;
  }
};

export const getShiftById = async (id) => {
  try {
    const response = await api.get(`/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching shift:', error);
    throw error;
  }
};

export const createShift = async (shiftData) => {
  try {
    const response = await api.post('/', shiftData);
    return response.data;
  } catch (error) {
    console.error('Error creating shift:', error);
    throw error;
  }
};

export const updateShift = async (id, shiftData) => {
  try {
    const response = await api.put(`/${id}`, shiftData);
    return response.data;
  } catch (error) {
    console.error('Error updating shift:', error);
    throw error;
  }
};

export const deleteShift = async (id) => {
  try {
    const response = await api.delete(`/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting shift:', error);
    throw error;
  }
};

export const getStats = async () => {
  try {
    const response = await api.get('/stats/summary');
    return response.data;
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw error;
  }
};

// =======================
// HELPER FUNCTIONS (unchanged)
// =======================

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

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

export const formatDateForInput = (dateString) => {
  if (typeof dateString === 'string' && dateString.length === 10 && !dateString.includes('T')) {
    return dateString;
  }
  const dateStr = String(dateString);
  if (dateStr.includes('T')) {
    return dateStr.split('T')[0];
  }
  const d = new Date(dateString);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDateForBackend = (dateString) => {
  if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return `${dateString}T12:00:00.000Z`;
  }
  if (typeof dateString === 'string' && dateString.includes('T')) {
    return dateString;
  }
  return new Date(dateString).toISOString();
};