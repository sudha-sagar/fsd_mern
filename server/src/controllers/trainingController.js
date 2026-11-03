const TrainingProgram = require('../models/TrainingProgram');
const Registration = require('../models/Registration');

const getTrainings = async (req, res, next) => {
  try {
    const trainings = await TrainingProgram.find().sort({ startDate: 1 });
    return res.status(200).json({
      success: true,
      message: 'Training programs retrieved successfully',
      data: trainings
    });
  } catch (error) {
    if (typeof next === 'function') return next(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getTrainingById = async (req, res, next) => {
  try {
    const training = await TrainingProgram.findById(req.params.id);
    if (!training) {
      return res.status(404).json({
        success: false,
        message: 'Training program not found'
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Training program retrieved successfully',
      data: training
    });
  } catch (error) {
    if (typeof next === 'function') return next(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createTraining = async (req, res, next) => {
  try {
    const {
      trainingTitle,
      trainerName,
      trainingCategory,
      startDate,
      endDate,
      duration,
      availableSeats
    } = req.body || {};

    if (
      !trainingTitle ||
      !trainerName ||
      !trainingCategory ||
      !startDate ||
      !endDate ||
      !duration ||
      availableSeats === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required training fields'
      });
    }

    if (Number(availableSeats) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Available seats cannot be negative'
      });
    }

    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({
        success: false,
        message: 'End date must be on or after start date'
      });
    }

    const training = await TrainingProgram.create({
      trainingTitle,
      trainerName,
      trainingCategory,
      startDate,
      endDate,
      duration,
      availableSeats: Number(availableSeats)
    });

    return res.status(201).json({
      success: true,
      message: 'Training program created successfully',
      data: training
    });
  } catch (error) {
    if (typeof next === 'function') return next(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateTraining = async (req, res, next) => {
  try {
    let training = await TrainingProgram.findById(req.params.id);

    if (!training) {
      return res.status(404).json({
        success: false,
        message: 'Training program not found'
      });
    }

    const { availableSeats, startDate, endDate } = req.body || {};

    if (availableSeats !== undefined && Number(availableSeats) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Available seats cannot be negative'
      });
    }

    const checkStartDate = startDate ? new Date(startDate) : training.startDate;
    const checkEndDate = endDate ? new Date(endDate) : training.endDate;

    if (checkEndDate < checkStartDate) {
      return res.status(400).json({
        success: false,
        message: 'End date must be on or after start date'
      });
    }

    training = await TrainingProgram.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Training program updated successfully',
      data: training
    });
  } catch (error) {
    if (typeof next === 'function') return next(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteTraining = async (req, res, next) => {
  try {
    const training = await TrainingProgram.findById(req.params.id);

    if (!training) {
      return res.status(404).json({
        success: false,
        message: 'Training program not found'
      });
    }

    await Registration.deleteMany({ training: req.params.id });
    await training.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Training program and associated registrations deleted successfully',
      data: {}
    });
  } catch (error) {
    if (typeof next === 'function') return next(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const registerForTraining = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const trainingId = req.params.id;

    const training = await TrainingProgram.findById(trainingId);
    if (!training) {
      return res.status(404).json({
        success: false,
        message: 'Training program not found'
      });
    }

    const existingRegistration = await Registration.findOne({
      student: studentId,
      training: trainingId
    });

    if (existingRegistration) {
      return res.status(409).json({
        success: false,
        message: 'You have already registered for this training program'
      });
    }

    if (training.availableSeats <= 0) {
      return res.status(400).json({
        success: false,
        message: 'No available seats for this training program'
      });
    }

    training.availableSeats -= 1;
    await training.save();

    const registration = await Registration.create({
      student: studentId,
      training: trainingId,
      registrationDate: new Date(),
      attendanceStatus: 'not_marked',
      completionStatus: 'not_completed'
    });

    await registration.populate([
      { path: 'student', select: 'name email role' },
      { path: 'training', select: 'trainingTitle trainerName trainingCategory startDate endDate duration' }
    ]);

    return res.status(201).json({
      success: true,
      message: 'Successfully registered for training program',
      data: registration
    });
  } catch (error) {
    if (typeof next === 'function') return next(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getTrainings,
  getTrainingById,
  createTraining,
  updateTraining,
  deleteTraining,
  registerForTraining
};
