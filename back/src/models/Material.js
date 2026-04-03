const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema(
  {
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      required: [true, 'Lesson is required'],
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],

    },

    title: {
      type: String,
      required: [true, 'Material title is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['video', 'link', 'file'],
      required: [true, 'Material type is required'],
    },
    url: {
      type: String,
      required: [true, 'URL is required'],
      trim: true,

    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Material', materialSchema);
