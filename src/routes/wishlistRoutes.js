const express = require('express');
const WishlistController = require('../controllers/wishlistController');
const authenticateClient = require('../middleware/clientAuth');

const router = express.Router();

router.use(authenticateClient);
router.get('/', WishlistController.getAll);
router.post('/', WishlistController.add);
router.get('/check/:idProduit', WishlistController.check);
router.delete('/:idProduit', WishlistController.remove);

module.exports = router;
