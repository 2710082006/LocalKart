const express = require('express');
const router = express.Router();
const {
  createComplaint, getMyComplaints, getComplaint, addMessage
} = require('../controllers/complaint.controller');
const { protect } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');
const upload = require('../middleware/upload');

router.use(protect); // All complaint routes require authentication

router.post('/', upload.array('images', 3), validate(schemas.createComplaint), createComplaint);
router.get('/', getMyComplaints);
router.get('/:id', getComplaint);
router.post('/:id/messages', addMessage);

module.exports = router;
