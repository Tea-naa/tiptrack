// This file defines all the API endpoints (routes) for shifts (CRUD)
// NOW WITH USER AUTHENTICATION + $25K TAX-FREE TIP FEATURE!

const express = require('express');
const router = express.Router();
const Shift = require('../models/Shift');
const authMiddleware = require('../middleware/auth');

// ========================================
// PROTECT ALL ROUTES - Must be logged in!
// ========================================
router.use(authMiddleware);

// ========================================
// STATS ROUTE (with $25K tax-free logic + USER FILTERING)
// ========================================
router.get('/stats/summary', async (req, res) => {
  try {
    // Get ONLY this user's shifts
    const allShifts = await Shift.find({ userId: req.userId });
    
    const now = new Date();
    const nowUTC = new Date(now.toISOString().split('T')[0] + 'T00:00:00.000Z');
    const currentYear = nowUTC.getUTCFullYear();
    const currentMonth = nowUTC.getUTCMonth();
    const currentDay = nowUTC.getUTCDay();
    
    const getDateString = (isoDate) => isoDate.toISOString().split('T')[0];
    const isToday = (shiftDate) => getDateString(new Date(shiftDate)) === getDateString(nowUTC);
    const isThisWeek = (shiftDate) => {
      const shiftDateStr = getDateString(new Date(shiftDate));
      const monday = new Date(nowUTC);
      if (currentDay === 0) {
        monday.setUTCDate(nowUTC.getUTCDate() - 6);
      } else {
        monday.setUTCDate(nowUTC.getUTCDate() - (currentDay - 1));
      }
      return shiftDateStr >= getDateString(monday);
    };
    const isThisMonth = (shiftDate) => {
      const dateStr = getDateString(new Date(shiftDate));
      const [year, month] = dateStr.split('-').map(Number);
      return year === currentYear && (month - 1) === currentMonth;
    };
    const isThisYear = (shiftDate) => {
      const [year] = getDateString(new Date(shiftDate)).split('-').map(Number);
      return year === currentYear;
    };
    
    const todayShifts = allShifts.filter(shift => isToday(shift.date));
    const weekShifts = allShifts.filter(shift => isThisWeek(shift.date));
    const monthShifts = allShifts.filter(shift => isThisMonth(shift.date));
    const yearShifts = allShifts.filter(shift => isThisYear(shift.date));
    
    const sumTips = (shifts, field) => 
      shifts.reduce((sum, shift) => sum + (shift[field] || 0), 0);
    
    const todayTotal = sumTips(todayShifts, 'totalTips');
    const weekTotal = sumTips(weekShifts, 'totalTips');
    const monthTotal = sumTips(monthShifts, 'totalTips');
    const todayClaimed = sumTips(todayShifts, 'claimedTips');
    const weekClaimed = sumTips(weekShifts, 'claimedTips');
    const monthClaimed = sumTips(monthShifts, 'claimedTips');
    const yearToDateClaimed = sumTips(yearShifts, 'claimedTips');
    const totalIncome = sumTips(allShifts, 'totalTips');
    
    const TAX_FREE_THRESHOLD = 25000;
    const taxableAmount = Math.max(yearToDateClaimed - TAX_FREE_THRESHOLD, 0);
    const averageTaxRate = yearShifts.length > 0
      ? yearShifts.reduce((sum, shift) => sum + shift.taxRate, 0) / yearShifts.length
      : 20;
    
    const calculateTaxForPeriod = (periodClaimed) => {
      if (yearToDateClaimed <= TAX_FREE_THRESHOLD) return 0;
      const taxablePortionOfPeriod = Math.min(periodClaimed, taxableAmount);
      return taxablePortionOfPeriod * (averageTaxRate / 100);
    };
    
    const todayTax = calculateTaxForPeriod(todayClaimed);
    const weekTax = calculateTaxForPeriod(weekClaimed);
    const monthTax = calculateTaxForPeriod(monthClaimed);
    const averagePerShift = allShifts.length > 0 ? sumTips(allShifts, 'totalTips') / allShifts.length : 0;
    const averageClaimed = allShifts.length > 0 ? sumTips(allShifts, 'claimedTips') / allShifts.length : 0;
    
    res.status(200).json({
      today: todayTotal,
      week: weekTotal,
      month: monthTotal,
      totalIncome,
      average: averagePerShift,
      todayClaimed,
      weekClaimed,
      monthClaimed,
      averageClaimed,
      todayTax,
      weekTax,
      monthTax,
      yearToDateClaimed,
      averageTaxRate,
      totalShifts: allShifts.length,
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
});

router.get('/stats/month', async (req, res) => {
  try {
    const { year, month } = req.query;
    if (!year || !month) {
      return res.status(400).json({ message: 'Please provide both year and month.' });
    }
    const startDate = new Date(`${year}-${month}-01T00:00:00.000Z`);
    const endDate = new Date(startDate);
    endDate.setUTCMonth(endDate.getUTCMonth() + 1);
    
    // Filter by user
    const monthlyShifts = await Shift.find({
      userId: req.userId,
      date: { $gte: startDate, $lt: endDate }
    });
    
    if (monthlyShifts.length === 0) {
      return res.status(200).json({ month, year, totalTips: 0, claimedTips: 0, taxWithholding: 0, message: 'No shifts found' });
    }
    
    const totalTips = monthlyShifts.reduce((sum, s) => sum + (s.totalTips || 0), 0);
    const claimedTips = monthlyShifts.reduce((sum, s) => sum + (s.claimedTips || 0), 0);
    const taxWithholding = monthlyShifts.reduce((sum, s) => sum + (s.taxWithholding || 0), 0);
    
    res.status(200).json({ month, year, totalTips, claimedTips, taxWithholding });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET all user's shifts
router.get('/', async (req, res) => {
  try {
    const shifts = await Shift.find({ userId: req.userId }).sort({ date: -1 });
    res.status(200).json(shifts);
  } catch (error){
    res.status(500).json({ message: 'Error fetching shifts', error: error.message});
  }
});

// GET one shift
router.get('/:id', async (req, res) => {
  try {
    const shift = await Shift.findOne({ _id: req.params.id, userId: req.userId });
    if (!shift) return res.status(404).json({ message: 'Shift not found'});
    res.status(200).json(shift);
  } catch (error){
    res.status(500).json({ message: 'Error fetching shift', error: error.message});
  }
});

// POST new shift (with userId)
router.post('/', async (req, res) => {
  try{
    const newShift = new Shift({
      ...req.body,
      userId: req.userId  // Add logged-in user's ID
    });
    const savedShift = await newShift.save();
    res.status(201).json(savedShift);
  } catch (error){
    res.status(400).json({ message: 'Error creating shift', error: error.message})
  }
});

// PUT update shift
router.put('/:id', async (req, res) => {
  try{
    const updatedShift = await Shift.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true, runValidators: true}
    );
    if (!updatedShift) return res.status(404).json({ message: 'Shift not found'});
    
    if (updatedShift.cashTips > 0 || updatedShift.creditTips > 0) {
      updatedShift.totalTips = updatedShift.cashTips + updatedShift.creditTips;
    }
    updatedShift.taxWithholding = updatedShift.claimedTips * (updatedShift.taxRate / 100);
    await updatedShift.save();
    
    res.status(200).json(updatedShift);
  } catch (error) {
    res.status(400).json({ message: 'Error updating shift', error: error.message });
  }
});

// DELETE shift
router.delete('/:id', async (req, res) => {
  try{
    const deletedShift = await Shift.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!deletedShift) return res.status(404).json({ message: 'Shift not found'});
    res.status(200).json({ message: 'Shift deleted successfully'});
  } catch (error){
    res.status(500).json({message: 'Error deleting shift', error: error.message});
  }
});

module.exports = router;