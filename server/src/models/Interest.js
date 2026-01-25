const mongoose = require('mongoose');

const interestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  foundItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoundItem',
    required: true
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING'
  },
  pickupInstructions: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for better query performance
interestSchema.index({ userId: 1, createdAt: -1 });
interestSchema.index({ foundItemId: 1, status: 1 });

module.exports = mongoose.model('Interest', interestSchema);
