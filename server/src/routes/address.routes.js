const express = require('express');
const router = express.Router();
const {
  getAddresses, createAddress, updateAddress, deleteAddress, setDefault, getAddress
} = require('../controllers/address.controller');
const { protect } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');

router.use(protect); // All address routes require authentication

router.get('/', getAddresses);
router.post('/', validate(schemas.createAddress), createAddress);
router.get('/:id', getAddress);
router.put('/:id', updateAddress);
router.delete('/:id', deleteAddress);
router.put('/:id/default', setDefault);

module.exports = router;
