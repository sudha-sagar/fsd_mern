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
        values: ['not_marked', 'present', 'absent'],
        message: 'Attendance status must be not_marked, present, or absent'
      },
      default: 'not_marked'
    },
    completionStatus: {
      type: String,
      enum: {
        values: ['not_completed', 'completed'],
        message: 'Completion status must be not_completed or completed'
      },
      default: 'not_completed'
    }
  },
  {
    timestamps: true
  }
);

// Unique compound index to prevent duplicate registrations for the same student and training program
registrationSchema.index({ student: 1, training: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);
