const express = require('express');
const ClientController = require('../controllers/clientController');
const authenticate = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);
router.get('/', ClientController.getAll);
router.put('/:id/status', ClientController.updateStatus);

module.exports = router;
