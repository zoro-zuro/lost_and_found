const mongoose = require('mongoose');

const foundItemSchema = new mongoose.Schema({
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
  dateFound: {
    type: Date,
    required: [true, 'Date found is required']
  },
  locationFound: {
    type: String,
    required: [true, 'Location found is required'],
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
  imageUrl: {
    type: mongoose.Schema.Types.Mixed, // Can store string or object
    default: null
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  linkedLostItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LostItem'
  },
  status: {
    type: String,
    enum: ['OPEN', 'CLOSED'],
    default: 'OPEN'
  },
  closedAt: {
    type: Date
  },
  // Visibility and moderation fields
  visibility: {
    type: String,
    enum: ['ADMIN_ONLY', 'PUBLIC'],
    default: 'PUBLIC'
  }
}, {
  timestamps: true
});

// Index for better query performance
foundItemSchema.index({ category: 1, itemName: 'text', description: 'text' });
foundItemSchema.index({ dateFound: -1 });
foundItemSchema.index({ visibility: 1, status: 1 });

module.exports = mongoose.model('FoundItem', foundItemSchema);
