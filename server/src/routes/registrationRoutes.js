const express = require('express');
const router = express.Router();
const {
  getMyRegistrations,
  getAllRegistrations,
  getTrainingRegistrations,
  updateRegistrationStatus
} = require('../controllers/registrationController');
const { protect, authorize } = require('../middleware/auth');

router.get('/my', protect, authorize('student'), getMyRegistrations);
router.get('/', protect, authorize('admin'), getAllRegistrations);
router.get('/training/:trainingId', protect, authorize('admin'), getTrainingRegistrations);
router.put('/:id', protect, authorize('admin'), updateRegistrationStatus);

module.exports = router;
