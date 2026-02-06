const express = require('express');
const router = express.Router();
const airportController = require('../controllers/airportController');
const { checkJwt } = require('../middleware/authMiddleware');


// ritorno aereo protetto popolo il jwt
router.post('/',checkJwt, airportController.createAirport); 

//cerco con get aerei metodo pubblico
router.get('/', airportController.getAirports)

module.exports = router;