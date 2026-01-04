const express = require('express');
const router = express.Router();
const routeController = require('../controllers/routesController');
const { checkJwt } = require('../middleware/authMiddleware');


// GET /api/routes (Tutti possono vedere le rotte disponibili)
router.get('/', routeController.getRoutes);

// POST /api/routes (Protetto: Solo chi ha il token, il controller controlla se è 'airline')
router.post('/', checkJwt, routeController.createRoute);

// DELETE /api/routes/:id (Protetto)
router.delete('/:id', checkJwt, routeController.deleteRoute);

module.exports = router;