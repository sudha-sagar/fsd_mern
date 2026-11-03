const mongoose = require('mongoose');

const trainingProgramSchema = new mongoose.Schema(
  {
    trainingTitle: {
      type: String,
      required: [true, 'Training title is required'],
      trim: true,
      maxlength: [150, 'Training title cannot exceed 150 characters']
    },
    trainerName: {
      type: String,
      required: [true, 'Trainer name is required'],
      trim: true
    },
    trainingCategory: {
      type: String,
      required: [true, 'Training category is required'],
      trim: true
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
      validate: {
        validator: function (value) {
          return !this.startDate || value >= this.startDate;
        },
        message: 'End date must be on or after start date'
      }
    },
    duration: {
      type: String,
      required: [true, 'Duration is required'],
      trim: true
    },
    availableSeats: {
      type: Number,
      required: [true, 'Available seats is required'],
      min: [0, 'Available seats cannot be negative']
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('TrainingProgram', trainingProgramSchema);
