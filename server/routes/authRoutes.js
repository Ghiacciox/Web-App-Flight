const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');
const { checkJwt } = require('../middleware/authMiddleware');


// ROTTA: POST /register
router.post('/register', authController.register);

// Usa Passport Basic Auth. Se passa, esegue authController.login
router.post('/login', passport.authenticate('basic', { session: false }), authController.login);

router.get('/users', checkJwt, authController.getUsers);

router.delete('/users/:id',checkJwt, authController.deleteAccount);

router.patch('/users', checkJwt, authController.changeData);

module.exports = router;