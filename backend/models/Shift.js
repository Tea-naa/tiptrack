// This file defines what a "Shift" looks like in the database
// Think of it as a blueprint for shift data

const mongoose = require('mongoose');

// Create a schema (blueprint) for a shift
const shiftSchema = new mongoose.Schema(
  {
    // Date of the shift
    date: {
      type: Date,
      required: true,  // Must have a date - can't save without it
    },
    
    // How many hours you worked
    hoursWorked: {
      type: Number,
      required: true,
      min: 0,  // Can't work negative hours
    },
    
    // ======================
    // TIP ENTRY OPTIONS
    // ======================
    // User can enter tips in two ways:
    // 1. Separate cash/credit (for detailed tracking)
    // 2. Just total tips (simpler, what you want)
    
    // Cash tips (optional - only if tracking separately)
    cashTips: {
      type: Number,
      default: 0,
      min: 0,
    },
    
    // Credit card tips (optional - only if tracking separately)
    creditTips: {
      type: Number,
      default: 0,
      min: 0,
    },
    
    // Total tips earned (actual amount you made)
    // This is REQUIRED - either entered directly or calculated from cash+credit
    totalTips: {
      type: Number,
      required: true,
      min: 0,
    },
    
    // ======================
    // TAX TRACKING
    // ======================
    // What you're claiming to the government (for taxes)
    // This is what goes on your tax return
    claimedTips: {
      type: Number,
      required: true,
      min: 0,
    },
    
    // Tax withholding percentage (default 20%)
    // User can adjust this based on their tax bracket
    taxRate: {
      type: Number,
      default: 20,  // 20% is a safe baseline for most servers/bartenders
      min: 0,
      max: 100,  // Can't be more than 100%
    },
    
    // Amount to set aside for taxes (calculated automatically)
    // Formula: claimedTips × (taxRate / 100)
    taxWithholding: {
      type: Number,
      default: 0,
      min: 0,
    },
    
    // Optional notes about the shift
    notes: {
      type: String,
      default: '',  // Empty string if no notes
    },
  },
  {
    // Mongoose will automatically add createdAt and updatedAt timestamps
    timestamps: true,
  }
);

// PRE-SAVE HOOK: Calculate fields before saving
// This runs automatically when you save a shift
shiftSchema.pre('save', function(next) {
  // 'this' refers to the shift document being saved
  
  // 1. Calculate totalTips if cash/credit are provided
  // If user entered cash + credit separately, add them up
  if (this.cashTips > 0 || this.creditTips > 0) {
    this.totalTips = this.cashTips + this.creditTips;
  }
  // Otherwise, totalTips is entered directly by user (no calculation needed)
  
  // 2. Calculate tax withholding
  // Formula: claimedTips × (taxRate / 100)
  // Example: $300 claimed × 20% = $60 to set aside
  this.taxWithholding = this.claimedTips * (this.taxRate / 100);
  
  next();  // Continue with saving
});

// Create the model from the schema
// 'Shift' is the name, shiftSchema is the blueprint
const Shift = mongoose.model('Shift', shiftSchema);


module.exports = Shift;