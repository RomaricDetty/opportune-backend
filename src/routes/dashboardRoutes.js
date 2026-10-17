const express = require('express');
const DashboardController = require('../controllers/dashboardController');
const authenticate = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);
router.get('/', DashboardController.getStats);

module.exports = router;
