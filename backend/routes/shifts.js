// This file defines all the API endpoints (routes) for shifts (CRUD)
// NOW WITH $25K TAX-FREE TIP FEATURE!

const express = require('express');
const router = express.Router();  // router lets us define routes
const Shift = require('../models/Shift');  // import our shift model

// ========================================
// STATS ROUTE (with $25K tax-free logic)
// IMPORTANT: This MUST come FIRST before /:id route
// ========================================

// GET /api/shifts/stats/summary
// Purpose: Get summary stats (today, this week, this month, AND year-to-date)
// NEW: Calculates tax using $25K tax-free threshold
router.get('/stats/summary', async (req, res) => {
  try {
    // Step 1: Get all shifts from database
    const allShifts = await Shift.find();
    
    const now = new Date();
    
    // Step 2: Get current date parts in UTC (to match MongoDB storage)
    // This prevents timezone bugs where dates shift by one day
    const nowUTC = new Date(now.toISOString().split('T')[0] + 'T00:00:00.000Z');
    const currentYear = nowUTC.getUTCFullYear();  // e.g., 2025
    const currentMonth = nowUTC.getUTCMonth();    // e.g., 10 (November, 0-indexed)
    const currentDay = nowUTC.getUTCDay();        // e.g., 2 (Tuesday, 0=Sunday)
    
    // HELPER FUNCTIONS for date filtering
    // These extract just the date part to avoid timezone issues
    
    // Helper: extract YYYY-MM-DD from ISO date string
    // "2025-11-04T00:00:00.000Z" → "2025-11-04"
    const getDateString = (isoDate) => {
      return isoDate.toISOString().split('T')[0];
    };
    
    // Helper: check if shift is today
    const isToday = (shiftDate) => {
      const shiftDateStr = getDateString(new Date(shiftDate));
      const todayStr = getDateString(nowUTC);
      return shiftDateStr === todayStr;
    };
    
    // Helper: check if shift is this week (Monday-Sunday)
    const isThisWeek = (shiftDate) => {
      const shiftDateStr = getDateString(new Date(shiftDate));
      
      // Calculate Monday of this week
      const monday = new Date(nowUTC);
      if (currentDay === 0) {
        // If today is Sunday, go back 6 days to get Monday
        monday.setUTCDate(nowUTC.getUTCDate() - 6);
      } else {
        // Otherwise, go back (currentDay - 1) days to get Monday
        monday.setUTCDate(nowUTC.getUTCDate() - (currentDay - 1));
      }
      const mondayStr = getDateString(monday);
      
      // Check if shift date is on or after Monday
      return shiftDateStr >= mondayStr;
    };
    
    // Helper: check if shift is this month
    const isThisMonth = (shiftDate) => {
      // Extract date string and split into components
      const dateStr = getDateString(new Date(shiftDate));
      const [year, month] = dateStr.split('-').map(Number);
      
      // Compare year and month (month in string is 1-12, getUTCMonth is 0-11)
      return year === currentYear && (month - 1) === currentMonth;
    };
    
    // NEW: Helper to check if shift is this year (for $25K tracking)
    const isThisYear = (shiftDate) => {
      const dateStr = getDateString(new Date(shiftDate));
      const [year] = dateStr.split('-').map(Number);
      return year === currentYear;
    };
    
    // Step 3: Filter shifts by time period
    const todayShifts = allShifts.filter(shift => isToday(shift.date));
    const weekShifts = allShifts.filter(shift => isThisWeek(shift.date));
    const monthShifts = allShifts.filter(shift => isThisMonth(shift.date));
    const yearShifts = allShifts.filter(shift => isThisYear(shift.date));  // NEW: for tax calculations
    
    // Helper function to sum up tips
    // Usage: sumTips(todayShifts, 'totalTips') → adds up all totalTips from today's shifts
    const sumTips = (shifts, field) => 
      shifts.reduce((sum, shift) => sum + (shift[field] || 0), 0);
    
    // Step 4: Calculate totals for each period
    // Total tips earned (actual money made)
    const todayTotal = sumTips(todayShifts, 'totalTips');
    const weekTotal = sumTips(weekShifts, 'totalTips');
    const monthTotal = sumTips(monthShifts, 'totalTips');
    
    // Claimed tips (what's being reported for taxes)
    const todayClaimed = sumTips(todayShifts, 'claimedTips');
    const weekClaimed = sumTips(weekShifts, 'claimedTips');
    const monthClaimed = sumTips(monthShifts, 'claimedTips');
    
    // NEW: Year-to-date claimed tips (needed for $25K threshold)
    const yearToDateClaimed = sumTips(yearShifts, 'claimedTips');
    const totalIncome = sumTips(allShifts, 'totalTips');
    
    // ==========================================
    // $25K TAX-FREE CALCULATION (THE MAGIC!)
    // ==========================================
    // Under 2024 law: First $25,000 in tips is tax-free
    // Only amounts OVER $25K are taxable
    
    const TAX_FREE_THRESHOLD = 25000;
    
    // Calculate how much is taxable (amount over $25K)
    // Math.max ensures we don't get negative numbers
    // Example: $28,000 YTD → $3,000 taxable
    const taxableAmount = Math.max(yearToDateClaimed - TAX_FREE_THRESHOLD, 0);
    
    // Get average tax rate from all shifts this year
    // Most servers use 20%, but we calculate actual average in case it varies
    const averageTaxRate = yearShifts.length > 0
      ? yearShifts.reduce((sum, shift) => sum + shift.taxRate, 0) / yearShifts.length
      : 20;
    
    // Function to calculate tax for a specific period (today, week, month)
    // This is smart - it only taxes the portion that's over $25K
    const calculateTaxForPeriod = (periodClaimed) => {
      // If we haven't hit $25K yet, no tax!
      if (yearToDateClaimed <= TAX_FREE_THRESHOLD) {
        return 0;
      }
      // Calculate what portion of this period's tips is taxable
      // Example: If YTD is $28K and month claimed is $5K,
      // only $3K is taxable (the portion over $25K)
      const taxablePortionOfPeriod = Math.min(periodClaimed, taxableAmount);
      return taxablePortionOfPeriod * (averageTaxRate / 100);
    };
    
    // Calculate tax for each period using the smart function above
    const todayTax = calculateTaxForPeriod(todayClaimed);
    const weekTax = calculateTaxForPeriod(weekClaimed);
    const monthTax = calculateTaxForPeriod(monthClaimed);
    
    // Step 5: Calculate averages (for "Average Per Shift" card)
    const averagePerShift = allShifts.length > 0 
      ? sumTips(allShifts, 'totalTips') / allShifts.length 
      : 0;
    
    const averageClaimed = allShifts.length > 0
      ? sumTips(allShifts, 'claimedTips') / allShifts.length
      : 0;
    
    // Step 6: Send all data back to frontend
    res.status(200).json({
      // Actual earnings (what you really made)
      today: todayTotal,
      week: weekTotal,
      month: monthTotal,
      totalIncome,
      average: averagePerShift,
      
      // Claimed earnings (what you're reporting for taxes)
      todayClaimed,
      weekClaimed,
      monthClaimed,
      averageClaimed,
      
      // Tax withholding (now respects $25K threshold!)
      // These amounts are ONLY on taxable income over $25K
      todayTax,
      weekTax,
      monthTax,
      
      // NEW: Year-to-date data for Tax-Free Tracker component
      yearToDateClaimed,      // Total claimed so far this year
      averageTaxRate,         // Average tax rate (usually 20%)
      
      // Shift count
      totalShifts: allShifts.length,
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
});
// ========================================
// GET /api/shifts/stats/month?year=YYYY&month=MM
// Purpose: Get totals for any specific month (for "Past Months" view)
// ========================================
router.get('/stats/month', async (req, res) => {
  try {
    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({ message: 'Please provide both year and month (YYYY & MM).' });
    }

    const startDate = new Date(`${year}-${month}-01T00:00:00.000Z`);
    const endDate = new Date(startDate);
    endDate.setUTCMonth(endDate.getUTCMonth() + 1); // next month start

    const monthlyShifts = await Shift.find({
      date: { $gte: startDate, $lt: endDate }
    });

    if (monthlyShifts.length === 0) {
      return res.status(200).json({
        month,
        year,
        totalTips: 0,
        claimedTips: 0,
        taxWithholding: 0,
        message: 'No shifts found for this month'
      });
    }

    // Totals
    const totalTips = monthlyShifts.reduce((sum, s) => sum + (s.totalTips || 0), 0);
    const claimedTips = monthlyShifts.reduce((sum, s) => sum + (s.claimedTips || 0), 0);
    const taxWithholding = monthlyShifts.reduce((sum, s) => sum + (s.taxWithholding || 0), 0);

    res.status(200).json({
      month,
      year,
      totalTips,
      claimedTips,
      taxWithholding
    });
  } catch (error) {
    console.error('Error fetching monthly stats:', error);
    res.status(500).json({ message: 'Server error fetching monthly stats', error: error.message });
  }
});


// ========================================
// REGULAR CRUD ROUTES
// ========================================

// GET /api/shifts
// Purpose: get ALL shifts
router.get('/', async (req, res) => {
    try {
    // find all shifts in db, sort by date (newest first)
    const shifts = await Shift.find().sort({ date: -1 });
    // send back as JSON with 200 status (success)
    res.status(200).json(shifts);
  } catch (error){
    res.status(500).json({ message: 'Error fetching shifts', error: error.message});
  }
});

// Get /api/shifts/:id
// Purpose: get ONE specific shift by ID
router.get('/:id', async (req, res) => {
    try {
    // req.params.id comes from the URL: /api/shifts/1234
    const shift = await Shift.findById(req.params.id);
    if (!shift){
        return res.status(400).json({ message: 'Shift not found'});
    }   
    res.status(200).json(shift);
    } catch (error){
        res.status(500).json({ message: 'Error fetching shifts', error: error.message});
    }
});

// POST /api/shifts
// Purpose: create a NEW shift
router.post('/', async (req, res) => {
    try{
        // req.body contains the data sent from the frontend (built in express library)
        const { 
            date, 
            hoursWorked,
            cashTips, 
            creditTips, 
            totalTips,
            claimedTips,
            taxRate,
            notes 
        } = req.body;

        // create new shift object
        const newShift = new Shift ({
            date,
            hoursWorked,
            cashTips: cashTips || 0,
            creditTips: creditTips || 0,
            totalTips,
            claimedTips,
            taxRate: taxRate || 20,  // default 20% if not provided
            notes,
            // taxWithholding will be calculated automatically by the pre-save hook (Shift.js model)
        });
        // save to database
        const savedShift = await newShift.save();
        // send back the saved shift with 201 status (created)
        res.status(201).json(savedShift);
    } catch (error){
        res.status(400).json({ message: 'Error creating shift', error: error.message})
    }
});

// PUT /api/shifts/:id
// Purpose: update an EXISTING shift
router.put('/:id', async (req, res) => {
    try{
        const { 
            date,
            hoursWorked, 
            cashTips,
            creditTips,
            totalTips,
            claimedTips,
            taxRate,
            notes,
        } = req.body;
    
        // find shift by ID and update it
        const updatedShift = await Shift.findByIdAndUpdate(
            req.params.id,
            {
                date,
                hoursWorked,
                cashTips: cashTips || 0,
                creditTips: creditTips || 0,
                totalTips,
                claimedTips,
                taxRate: taxRate || 20,  // default 20% if not provided
                notes,
            },
            // {new: true} means "return the UPDATED shift, not the old one", 
            // runValidators: check min/max rules
            { new: true, runValidators: true}
        );
        if (!updatedShift){
            return res.status(404).json({ message: 'Shift not found'});
        }
        // Recalculate totalTips and taxWithholding
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

// DELETE /api/shift/:id
// Purpose: DELETE a shift 
router.delete('/:id', async (req, res) => {
    try{
       const deletedShift = await Shift.findByIdAndDelete(req.params.id);
       // if shift wasn't found (deletedShift = null)
       if (!deletedShift) {
        return res.status(404).json({ message: 'Shift not found'});
       }
       res.status(200).json({ message: 'Shift deleted successfully'});
    } catch (error){
        res.status(500).json({message: 'Error deleting shift', error: error.message});
    }
});

module.exports = router;


// ==========================================
// HOW THE $25K TAX-FREE FEATURE WORKS:
// ==========================================

// EXAMPLE 1: User has claimed $18,500 year-to-date
// - yearToDateClaimed: $18,500
// - TAX_FREE_THRESHOLD: $25,000
// - taxableAmount: $0 (still under threshold)
// - todayTax: $0
// - weekTax: $0
// - monthTax: $0
// Result: No tax yet! Still in tax-free zone.

// EXAMPLE 2: User has claimed $28,000 year-to-date
// - yearToDateClaimed: $28,000
// - TAX_FREE_THRESHOLD: $25,000
// - taxableAmount: $3,000 ($28K - $25K)
// - If this month claimed $5,000:
//   - taxablePortionOfPeriod: $3,000 (can't exceed total taxable)
//   - monthTax: $3,000 × 20% = $600
// Result: Only pay tax on the $3K over the threshold!

// WHY THIS IS BETTER THAN THE OLD WAY:
// Old way: $28,000 × 20% = $5,600 in taxes 😱
// New way: $3,000 × 20% = $600 in taxes ✅
// SAVINGS: $5,000! 🎉
