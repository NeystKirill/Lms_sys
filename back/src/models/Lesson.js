const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema(
  {
    scheduleDayId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ScheduleDay',
      required: [true, 'Schedule day is required'],
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: [true, 'Group is required'],

    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Teacher is required'],
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject is required'],
    },

    lessonNumber: {
      type: Number,
      required: [true, 'Lesson number is required'],
      min: [1, 'Lesson number must be at least 1'],
      max: [8, 'Lesson number must be at most 8'],
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],

    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],

    },

    topic: {
      type: String,
      trim: true,

    },
    description: {
      type: String,
      trim: true,
    },
    // Status for schedule management
    status: {
      type: String,
      enum: ['active', 'cancelled', 'replaced'],
      default: 'active',
    },
    replacesLessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      default: null,
    },
    statusNote: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

lessonSchema.index({ scheduleDayId: 1, lessonNumber: 1 }, { unique: true });

module.exports = mongoose.model('Lesson', lessonSchema);
