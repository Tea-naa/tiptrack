// =======================
// USER MODEL
// =======================
// This defines what a "user" looks like in our database
// Think of it as a template: every user will have username, password, createdAt

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the structure of a User
const userSchema = new mongoose.Schema ({
    username: {
        type: String,
        required: true,
        unique: true,      // no two users can have same username
        trim: true,
        lowercase: true,
        minlength: 3,
        maxlength: 20
    },

    // Password field will be hashed, not stored as plain text
    password: {
        type: String,
        required: true,
        minlength: 6
    },

    // Timestamps - Mongoose automatically adds these
    // createdAt = when user signed up
    // updatedAt = when user info last changed
}, {
    timestamps: true // automatically adds createdAt and updatedAt fields
});

// =======================
// PRE-SAVE HOOK
// =======================
// This runs BEFORE saving a user to database
// Purpose: Hash the password so we never store plain text passwords!

userSchema.pre('save', async function(next){
    // 'this' refers to the user document being saved

    // only hash password if it's new or has been changed
    // don't re-hash if user is just updating their username
    if (!this.isModified('password')){
        return next();   // skip hashing, move to next step
    }
    // Generate a "salt" - random data that makes hashing more secure
    // 10 = how complex the hashing is (higher = more secure but slower)
    const salt = await bcrypt.genSalt(10);  //  Generate the salt
    this.password = await bcrypt.hash(this.password, salt);  // Then hash password with salt

    next();
});

// =======================
// CUSTOM METHOD: Compare Passwords
// =======================
// This method lets us check if entered password matches stored hash
// Usage: user.comparePassword('password123') → returns true or false

userSchema.methods.comparePassword = async function(enteredPassword){
    // bcrypt.compare() checks if plain text password matches the hash
    // Returns true if match, false if doesn't match
    return await bcrypt.compare(enteredPassword, this.password);
};

// Create the User Model from the schema
// 'User' is the name, userSchema is the structure defined above
const User = mongoose.model('User', userSchema);

module.exports = User;

// =======================
// HOW THIS WORKS (Example):
// =======================

// 1. User signs up:
//    username: "bartender123"
//    password: "mypassword"

// 2. Pre-save hook runs:
//    - Generates salt
//    - Hashes "mypassword" → "$2a$10$abc...xyz" (gibberish!)
//    - Stores "$2a$10$abc...xyz" in database (NOT "mypassword")

// 3. User logs in later:
//    - Enters "mypassword"
//    - We call: user.comparePassword("mypassword")
//    - bcrypt checks if "mypassword" matches stored hash
//    - Returns true → user is authenticated!

// This way, even if someone hacks our database, they can't see real passwords!