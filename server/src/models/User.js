const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        // AMC college email format: 23bit15@americancollege.edu.in
        return /^[a-z0-9]+@americancollege\.edu\.in$/i.test(v);
      },
      message: 'Email must be a valid AMC college email (e.g., 23bit15@americancollege.edu.in)'
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['STUDENT', 'STAFF', 'ADMIN'],
    required: [true, 'Role is required'],
    default: 'STUDENT'
  },
  
  // Single internal field for raw ID (Register Number or Staff ID)
  institutionalId: {
    type: String,
    required: [true, 'Institutional ID is required'],
    trim: true
  },

  // Unique composite field (STD-ID or EMP-ID)
  userCode: {
    type: String,
    unique: true,
    trim: true
  },

  // Shared location field (Block/Hall for students)
  block: {
    type: String,
    trim: true,
    required: function() {
      return this.role === 'STUDENT';
    }
  },
  
  isApproved: {
    type: Boolean,
    default: function() {
      return this.role === 'STUDENT'; // Students auto-approved
    }
  },
  
  department: {
    type: String,
    trim: true,
    required: function() {
      return this.role === 'STUDENT';
    }
  },
  phone: {
    type: String,
    trim: true
  },
  altPhone: {
    type: String,
    trim: true
  },
  emailNotificationsEnabled: {
    type: Boolean,
    default: true
  },
  notifyScope: {
    type: String,
    enum: ['all', 'admin-only', 'none'],
    default: 'all'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals to keep frontend compatibility without changing React code
userSchema.virtual('registerNumber').get(function() {
  return this.role === 'STUDENT' ? this.institutionalId : undefined;
}).set(function(v) {
  if (this.role === 'STUDENT') this.institutionalId = v;
});

userSchema.virtual('staffId').get(function() {
  return (this.role === 'STAFF' || this.role === 'ADMIN') ? this.institutionalId : undefined;
}).set(function(v) {
  if (this.role === 'STAFF' || this.role === 'ADMIN') this.institutionalId = v;
});

// Middleware to generate unique userCode and hash password
userSchema.pre('save', async function() {
  // Generate userCode
  const prefix = this.role === 'STUDENT' ? 'STD' : 'EMP';
  if (this.institutionalId) {
    this.userCode = `${prefix}-${this.institutionalId.toUpperCase()}`;
  }

  // Hash password
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Clean JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  // Ensure virtuals look like real fields for the frontend
  if (this.role === 'STUDENT') {
    userObject.registerNumber = this.institutionalId;
  } else {
    userObject.staffId = this.institutionalId;
  }
  return userObject;
};

module.exports = mongoose.model('User', userSchema);
