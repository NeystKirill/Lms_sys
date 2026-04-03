const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema(
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
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Grader is required'],
    },
    value: {
      type: mongoose.Mixed,
      validate: {
        validator: function(v) {
          if (v === 'Н') return true;
          const n = Number(v);
          return !isNaN(n) && n >= 0 && n <= 100;
        },
        message: 'Оценка должна быть от 0 до 100 или "Н"',
      },
      required: [true, 'Grade value is required'],
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

gradeSchema.index({ lessonId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('Grade', gradeSchema);
