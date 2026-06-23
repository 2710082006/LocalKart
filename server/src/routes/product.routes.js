const express = require('express');
const router = express.Router();

const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getCategories,
  getNearbyProducts
} = require('../controllers/product.controller');

const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');
const upload = require('../middleware/upload');

// IMPORTANT FIX HERE → optionalAuth added
router.get('/', optionalAuth, getProducts);

router.get('/featured', getFeaturedProducts);
router.get('/categories', getCategories);
router.get('/nearby', getNearbyProducts);

router.get('/:id', optionalAuth, getProduct);

router.post(
  '/',
  protect,
  authorize('farmer'),
  upload.array('images', 5),
  validate(schemas.createProduct),
  createProduct
);

router.put(
  '/:id',
  protect,
  authorize('farmer'),
  upload.array('images', 5),
  validate(schemas.updateProduct),
  updateProduct
);

router.delete(
  '/:id',
  protect,
  authorize('farmer', 'admin'),
  deleteProduct
);

module.exports = router;