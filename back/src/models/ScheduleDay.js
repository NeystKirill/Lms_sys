const mongoose = require('mongoose');

const scheduleDaySchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: [true, 'Group is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },

    notes: {
      type: String,
      trim: true,

    },
  },
  {
    timestamps: true,
  }
);

scheduleDaySchema.index({ groupId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('ScheduleDay', scheduleDaySchema);
