const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID is required']
    },
    training: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TrainingProgram',
      required: [true, 'Training program ID is required']
    },
    registrationDate: {
      type: Date,
      default: Date.now
    },
    attendanceStatus: {
      type: String,
      enum: {
        values: ['Pending', 'Present', 'Absent'],
        message: 'Attendance status must be Pending, Present, or Absent'
      },
      default: 'Pending'
    },
    completionStatus: {
      type: String,
      enum: {
        values: ['Enrolled', 'Completed', 'Incomplete'],
        message: 'Completion status must be Enrolled, Completed, or Incomplete'
      },
      default: 'Enrolled'
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate registrations for the same student and training program
registrationSchema.index({ student: 1, training: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);
