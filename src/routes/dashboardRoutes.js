const express = require('express');
const DashboardController = require('../controllers/dashboardController');
const authenticate = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissions');

const router = express.Router();

router.use(authenticate);
router.get('/', DashboardController.getStats);
router.get('/counters', DashboardController.getCounters);
router.get('/health', DashboardController.getCatalogHealth);
router.get('/logs', requirePermission('admins'), DashboardController.getLogs);

module.exports = router;
