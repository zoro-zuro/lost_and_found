const mongoose = require('mongoose');

const lostItemSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  itemName: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['ID Card', 'Phone', 'Wallet', 'Bag', 'Keys', 'Book', 'Electronics', 'Other']
  },
  dateLost: {
    type: Date,
    required: [true, 'Date lost is required']
  },
  locationLost: {
    type: String,
    required: [true, 'Location lost is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    minlength: [10, 'Description must be at least 10 characters long']
  },
  color: {
    type: String,
    trim: true
  },
  brand: {
    type: String,
    trim: true
  },
  uniqueMark: {
    type: String,
    trim: true
  },
  contactPhone: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['OPEN', 'MATCHED', 'CLOSED'],
    default: 'OPEN'
  }
}, {
  timestamps: true
});

// Index for better query performance
lostItemSchema.index({ userId: 1, createdAt: -1 });
lostItemSchema.index({ category: 1, itemName: 'text', description: 'text' });

module.exports = mongoose.model('LostItem', lostItemSchema);
