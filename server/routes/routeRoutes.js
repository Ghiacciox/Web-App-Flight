const express = require('express');
const router = express.Router();
const routeController = require('../controllers/routesController');
const { checkJwt } = require('../middleware/authMiddleware');


// GET /api/routes
//dato che viene usato solo dall'admin ci metto il checkJwt
//per il passeggero c'è l'helper che cerca per nomi aeroporti fatto ogiusto per coerenza
router.get('/', checkJwt,routeController.getRoutes);

// POST /api/routes (Protetto: Solo chi ha il token, il controller controlla se è 'airline')
router.post('/', checkJwt, routeController.createRoute);

// DELETE /api/routes/:id (Protetto)
router.delete('/:id', checkJwt, routeController.deleteRoute);

module.exports = router;