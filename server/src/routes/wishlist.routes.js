const express = require('express');
const router = express.Router();
const {
  getWishlist, addToWishlist, removeFromWishlist, checkWishlist, clearWishlist
} = require('../controllers/wishlist.controller');
const { protect } = require('../middleware/auth');

router.use(protect); // All wishlist routes require authentication

router.get('/', getWishlist);
router.delete('/', clearWishlist);
router.post('/:productId', addToWishlist);
router.delete('/:productId', removeFromWishlist);
router.get('/check/:productId', checkWishlist);

module.exports = router;
