const express = require('express');
const router = express.Router();
const {
  createReview, getProductReviews, getFarmerReviews, updateReview,
  deleteReview, markHelpful, respondToReview, getMyReviews
} = require('../controllers/review.controller');
const { protect, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');
const upload = require('../middleware/upload');

router.get('/my-reviews', protect, getMyReviews);
router.get('/product/:productId', getProductReviews);
router.get('/farmer/:farmerId', getFarmerReviews);

router.post('/',
  protect,
  authorize('customer'),
  upload.array('images', 3),
  validate(schemas.createReview),
  createReview
);

router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);
router.put('/:id/helpful', protect, markHelpful);
router.put('/:id/respond', protect, authorize('farmer'), respondToReview);

module.exports = router;
