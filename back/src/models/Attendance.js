const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      required: [true, 'Lesson is required'],
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student is required'],
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Marker (teacher) is required'],

    },

    status: {
      type: String,
      enum: ['present', 'absent', 'late'],
      required: [true, 'Status is required'],
    },
    note: {
      type: String,
      trim: true,

    },
  },
  {
    timestamps: true,
  }
);

attendanceSchema.index({ lessonId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
