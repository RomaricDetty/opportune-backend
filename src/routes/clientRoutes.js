const express = require('express');
const ClientController = require('../controllers/clientController');
const authenticateClient = require('../middleware/clientAuth');

const router = express.Router();

router.post('/register', ClientController.register);
router.post('/login', ClientController.login);
router.get('/me', authenticateClient, ClientController.me);
router.put('/me', authenticateClient, ClientController.updateProfile);

module.exports = router;
