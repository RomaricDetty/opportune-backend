const express = require('express');
const OrderController = require('../controllers/orderController');
const authenticate = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);
router.get('/', OrderController.getAll);
router.get('/:id', OrderController.adminGetById);
router.put('/:id/statut', OrderController.updateStatut);

module.exports = router;
