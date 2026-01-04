const express = require('express');
const router = express.Router();
const ticketsController = require('../controllers/ticketsController');
const { checkJwt } = require('../middleware/authMiddleware');


// ritorno aereo protetto popolo il jwt
router.post('/',checkJwt, ticketsController.createTicket);

//cerco con get aerei metodo pubblico
router.get('/', checkJwt, ticketsController.getTickets);

router.delete('/:ticketID', checkJwt, ticketsController.deleteTicket);

module.exports = router;