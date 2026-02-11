const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');
const { checkJwt } = require('../middleware/authMiddleware');


// ROTTA: POST /register
router.post('/register', authController.register);

// ROTTA: GET /login
// Usa Passport Basic Auth. Se passa, esegue authController.login
router.get('/login', passport.authenticate('basic', { session: false }), authController.login);

router.get('/Users', checkJwt, authController.getUsers);

router.delete('/Users/:id',checkJwt, authController.deleteAccount);

router.patch('/changeData', checkJwt, authController.changeData);

module.exports = router;