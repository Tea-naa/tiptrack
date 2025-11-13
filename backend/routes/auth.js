// =======================
// AUTH ROUTES 
// =======================
// This file handles user signup and login
// Two endpoints: POST /signup and POST /login

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// =======================
// SIGNUP ROUTE
// =======================
// POST /api/auth/signup
// Purpose: Create a new user account

router.post('/signup', async (req, res) => {
    try{
        // Step 1. Get data from request body
        const { username, password } = req.body;
        // Step 2. Validate
        if (!username || !password){
            return res.status(400).json({message: 'Username and password required'});
        }
        // Step 3. Check if username already exists
        const exisitingUser = await User.findOne({username});
        if (exisitingUser){
            return res.status(400).json({message: 'Username already taken'});
        }
        // Step 4. Create new user
        // The password will be automatically hashed by the pre-saved hook in User.js
        const user = new User({ username, password });
        await user.save();  // save to db

        // Step 5. Create JWT token 
        const token = jwt.sign(
            { userId: user._id },       // Payload: whats inside the token
            process.env.JWT_SECRET,     // Secret key (add to .env)
            { expiresIn: '90d'}         // Token expires in 90 days
        );
        // Step 6. Send success response
        res.status(201).json({
            message: 'User created successfully',
            token,                      // Send token to frotnend
            user: {
                id: user._id,
                username: user.username
            }
        });
    } catch (error){
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Sever error during signup'});
    }
});

// =======================
// LOGIN ROUTE
// =======================
// POST /api/auth/login
// Purpose: Verify user credentials and give them a token

router.post('/login', async (req, res) => {
    try {
        // Step 1. get username and password from request
        const { username, password } = req.body;

        // Step 2. Validate
        if (!username || !password){
            return res.status(400).json({message: 'Username and password required'});
        }
        // Step 3. Find user in db
        const user = await User.findOne ({ username });
        if (!user){
            // user doesn't exist
            return res.status(401).json ({ message: 'Invalid credentials' });
        }
        // Step 4. Check if password matches
        // This uses the comparePassword method in User.js
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid){
            // password is wrong
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        // Step 5. Password is correct - create JWT token
        const token = jwt.sign(
            { userId: user._id },        // Payload: unique user ID
            process.env.JWT_SECRET,      // secret key from .env
            { expiresIn: '90d'}
        );
        // Step 6. Send success response with token
        res.status(200).json({
            message: 'Login successful',
            token,              // frontend will save this
            user: {
                id: user._id,
                username: user.username
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Sever error during login'});
    }
});


module.exports = router;