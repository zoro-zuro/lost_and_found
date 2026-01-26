const multer = require('multer');
const path = require('path');
const fs = require('fs');

// For Vercel serverless, use memory storage instead of disk storage
const storage = multer.memoryStorage();

// File filter to only allow images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Helper function to get image URL (for now, return base64 or placeholder)
const getImageUrl = (filename) => {
  if (!filename) return null;
  // In production, you might want to use a cloud storage service
  return `/uploads/${filename}`;
};

// Helper function to delete image file (no-op for memory storage)
const deleteImage = (filename) => {
  // No-op for memory storage
  return;
};

module.exports = {
  upload,
  getImageUrl,
  deleteImage
};
