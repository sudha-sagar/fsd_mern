const Registration = require('../models/Registration');

// @desc    Get logged in student's registrations
// @route   GET /api/registrations/my
// @access  Private (Student only)
const getMyRegistrations = async (req, res, next) => {
  try {
    const registrations = await Registration.find({ student: req.user._id })
      .populate({
        path: 'training',
        select: 'trainingTitle trainerName trainingCategory startDate endDate duration availableSeats'
      })
      .sort({ registrationDate: -1 });

    res.status(200).json({
      success: true,
      message: 'Student registrations retrieved successfully',
      data: registrations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all registrations across all students
// @route   GET /api/registrations
// @access  Private (Admin only)
const getAllRegistrations = async (req, res, next) => {
  try {
    const registrations = await Registration.find()
      .populate({
        path: 'student',
        select: 'name email role'
      })
      .populate({
        path: 'training',
        select: 'trainingTitle trainerName trainingCategory startDate endDate duration'
      })
      .sort({ registrationDate: -1 });

    res.status(200).json({
      success: true,
      message: 'All registrations retrieved successfully',
      data: registrations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get registrations for a specific training program
// @route   GET /api/registrations/training/:trainingId
// @access  Private (Admin only)
const getTrainingRegistrations = async (req, res, next) => {
  try {
    const { trainingId } = req.params;

    const registrations = await Registration.find({ training: trainingId })
      .populate({
        path: 'student',
        select: 'name email role'
      })
      .populate({
        path: 'training',
        select: 'trainingTitle trainerName trainingCategory startDate endDate duration'
      })
      .sort({ registrationDate: -1 });

    res.status(200).json({
      success: true,
      message: 'Training registrations retrieved successfully',
      data: registrations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update attendance or completion status for a registration record
// @route   PUT /api/registrations/:id
// @access  Private (Admin only)
const updateRegistrationStatus = async (req, res, next) => {
  try {
    const { attendanceStatus, completionStatus } = req.body;

    const validAttendance = ['not_marked', 'present', 'absent'];
    const validCompletion = ['not_completed', 'completed'];

    if (attendanceStatus && !validAttendance.includes(attendanceStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid attendanceStatus. Allowed values: ${validAttendance.join(', ')}`
      });
    }

    if (completionStatus && !validCompletion.includes(completionStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid completionStatus. Allowed values: ${validCompletion.join(', ')}`
      });
    }

    let registration = await Registration.findById(req.params.id);

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration record not found'
      });
    }

    if (attendanceStatus) {
      registration.attendanceStatus = attendanceStatus;
    }
    if (completionStatus) {
      registration.completionStatus = completionStatus;
    }

    await registration.save();

    await registration.populate([
      { path: 'student', select: 'name email role' },
      { path: 'training', select: 'trainingTitle trainerName trainingCategory startDate endDate duration' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Registration record updated successfully',
      data: registration
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyRegistrations,
  getAllRegistrations,
  getTrainingRegistrations,
  updateRegistrationStatus
};
