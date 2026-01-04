const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');


// ROTTA: POST /register
router.post('/register', authController.register);

// ROTTA: GET /login
// Usa Passport Basic Auth. Se passa, esegue authController.login
router.get('/login', passport.authenticate('basic', { session: false }), authController.login);

module.exports = router;