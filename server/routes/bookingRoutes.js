const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { checkJwt } = require('../middleware/authMiddleware');


router.post('/',checkJwt, bookingController.createBooking);

router.get('/', checkJwt, bookingController.getBooking)

router.delete('/:bookingId', checkJwt, bookingController.cancelBooking);

module.exports = router;