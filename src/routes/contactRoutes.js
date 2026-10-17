const express = require('express')
const ContactController = require('../controllers/contactController')
const authenticate = require('../middleware/auth')
const { contactLimiter } = require('../middleware/rateLimiters')

const router = express.Router()

/** Public : envoi du formulaire contact */
router.post('/', contactLimiter, ContactController.create)

/** Admin */
router.get('/', authenticate, ContactController.getAll)
router.patch('/:id/statut', authenticate, ContactController.updateStatut)

module.exports = router
