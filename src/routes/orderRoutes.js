const express = require('express');
const OrderController = require('../controllers/orderController');
const authenticateClient = require('../middleware/clientAuth');

const router = express.Router();

router.post('/', authenticateClient, OrderController.create);
router.get('/me', authenticateClient, OrderController.getMine);
router.get('/:id', authenticateClient, OrderController.getById);

module.exports = router;
