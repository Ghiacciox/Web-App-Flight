const express = require('express');
const router = express.Router();
const flightsController = require('../controllers/flightsController');
const { checkJwt } = require('../middleware/authMiddleware');


// ritorno aereo protetto popolo il jwt
router.post('/',checkJwt, flightsController.createFlights);

//cerco con get aerei metodo pubblico
router.get('/', flightsController.getFlights);

router.delete('/:id', checkJwt, flightsController.deleteFlight);

router.patch('/:id', checkJwt, flightsController.updateFlight);


module.exports = router;