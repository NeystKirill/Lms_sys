const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Group name is required'],
      unique: true,
      trim: true,

    },
    description: {
      type: String,
      trim: true,
    },

    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    teachers: [
      {
        teacherId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        role: {
          type: String,
          enum: ['main', 'assistant'],
          default: 'main',

        },
        subjects: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subject',
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Group', groupSchema);
