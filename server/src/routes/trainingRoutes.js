const express = require('express');
const router = express.Router();
const {
  getTrainings,
  getTrainingById,
  createTraining,
  updateTraining,
  deleteTraining,
  registerForTraining
} = require('../controllers/trainingController');
const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(protect, getTrainings)
  .post(protect, authorize('admin'), createTraining);

router
  .route('/:id')
  .get(protect, getTrainingById)
  .put(protect, authorize('admin'), updateTraining)
  .delete(protect, authorize('admin'), deleteTraining);

router
  .route('/:id/register')
  .post(protect, authorize('student'), registerForTraining);

module.exports = router;
