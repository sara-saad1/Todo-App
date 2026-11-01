const mongoose = require('mongoose');
const { TASK_CATEGORIES, MAX_TITLE_LENGTH, MAX_DESC_LENGTH } = require('../config/constants');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [1, 'Title cannot be empty'],
      maxlength: [MAX_TITLE_LENGTH, `Title cannot exceed ${MAX_TITLE_LENGTH} characters`],
    },

    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [MAX_DESC_LENGTH, `Description cannot exceed ${MAX_DESC_LENGTH} characters`],
    },

    completed: {
      type: Boolean,
      default: false,
      // not putting an index here — the collection won't grow large enough
      // for a boolean index to make any real difference
    },

    // I added dueDate as a Date type instead of a String so MongoDB can do
    // proper date comparisons. This matters for the /stats endpoint where we
    // query tasks where dueDate < today to count overdue ones.
    dueDate: {
      type: Date,
      default: null,
    },

    // Using an enum here instead of just a plain String so MongoDB itself
    // rejects invalid categories, not just the route validator. Two layers
    // of validation means even direct DB inserts (e.g. via a script) stay clean.
    category: {
      type: String,
      trim: true,
      default: 'General',
      enum: {
        values: TASK_CATEGORIES,
        message: '{VALUE} is not a valid category',
      },
    },
  },
  {
    // timestamps: true saves me from manually managing createdAt/updatedAt.
    // Mongoose handles it automatically and it's always accurate.
    timestamps: true,
  }
);

module.exports = mongoose.model('Task', taskSchema);
