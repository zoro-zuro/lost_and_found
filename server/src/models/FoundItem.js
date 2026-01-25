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
  imageUrl: {
    type: String,
    trim: true
  },
  linkedLostItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LostItem'
  }
}, {
  timestamps: true
});

// Index for better query performance
foundItemSchema.index({ category: 1, itemName: 'text', description: 'text' });
foundItemSchema.index({ dateFound: -1 });

module.exports = mongoose.model('FoundItem', foundItemSchema);
