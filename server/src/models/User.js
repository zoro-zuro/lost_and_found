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
  
  // Student-specific fields
  registerNumber: {
    type: String,
    trim: true,
    sparse: true,
    unique: true,
    required: function() {
      return this.role === 'STUDENT';
    }
  },
  block: {
    type: String,
    trim: true,
    required: function() {
      return this.role === 'STUDENT';
    }
  },
  
  // Staff/Admin-specific fields
  staffId: {
    type: String,
    trim: true,
    sparse: true,
    unique: true,
    required: function() {
      return this.role === 'STAFF' || this.role === 'ADMIN';
    }
  },
  isApproved: {
    type: Boolean,
    default: function() {
      return this.role === 'STUDENT'; // Students auto-approved, staff/admin need approval
    }
  },
  
  // Common optional fields
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
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);
