const express = require('express');
const router = express.Router();
const ticketsController = require('../controllers/ticketsController');
const { checkJwt } = require('../middleware/authMiddleware');

/*
router.post('/',checkJwt, ticketsController.createTicket);

router.get('/', checkJwt, ticketsController.getTickets);

router.delete('/:ticketID', checkJwt, ticketsController.deleteTicket);
*/

module.exports = router;