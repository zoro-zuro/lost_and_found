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
  
  // Visibility and moderation fields
  visibility: {
    type: String,
    enum: ['ADMIN_ONLY', 'CAMPUS'],
    default: 'CAMPUS'
  },
  notifyRequested: {
    type: Boolean,
    default: false
  },
  reviewStatus: {
    type: String,
    enum: ['PENDING_REVIEW', 'APPROVED', 'REJECTED'],
    default: 'PENDING_REVIEW'
  },
  publishStatus: {
    type: String,
    enum: ['DRAFT', 'PUBLISHED'],
    default: 'DRAFT'
  },
  adminNote: {
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

// Pre-save middleware to set initial review/publish status
lostItemSchema.pre('save', function(next) {
  if (this.isNew) {
    // If visibility is ADMIN_ONLY and no notification requested
    if (this.visibility === 'ADMIN_ONLY' && !this.notifyRequested) {
      this.reviewStatus = 'APPROVED';
      this.publishStatus = 'DRAFT';
    } else {
      // If CAMPUS visibility OR notification requested
      this.reviewStatus = 'PENDING_REVIEW';
      this.publishStatus = 'DRAFT';
    }
  }
  next();
});

// Index for better query performance
lostItemSchema.index({ userId: 1, createdAt: -1 });
lostItemSchema.index({ category: 1, itemName: 'text', description: 'text' });
lostItemSchema.index({ publishStatus: 1, visibility: 1, reviewStatus: 1 });

module.exports = mongoose.model('LostItem', lostItemSchema);
