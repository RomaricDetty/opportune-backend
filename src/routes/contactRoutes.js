const express = require('express')
const ContactController = require('../controllers/contactController')
const authenticate = require('../middleware/auth')
const { requirePermission } = require('../middleware/permissions')

const canManageOrders = requirePermission('orders')
const { contactLimiter } = require('../middleware/rateLimiters')

const router = express.Router()

/** Public : envoi du formulaire contact */
router.post('/', contactLimiter, ContactController.create)

/** Admin */
router.get('/', authenticate, canManageOrders, ContactController.getAll)
router.patch('/:id/statut', authenticate, canManageOrders, ContactController.updateStatut)

module.exports = router
