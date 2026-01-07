const express = require('express');
const router = express.Router();
const airplaneController = require('../controllers/airplaneController');
const { checkJwt } = require('../middleware/authMiddleware');


// ritorno aereo protetto popolo il jwt
router.post('/',checkJwt, airplaneController.createAirplane);

//cerco con get aerei metodo pubblico
router.get('/', airplaneController.getAirplane)

// elimino aereo protetto solo admin
//no testato
router.delete('/:id', checkJwt, airplaneController.deleteAirplane);

module.exports = router;