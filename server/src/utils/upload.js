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

// Helper function to convert buffer to base64 and store in database
const processImageUpload = (file) => {
  if (!file) return null;
  
  try {
    // Convert image buffer to base64
    const base64Image = file.buffer.toString('base64');
    
    // Create data URL with proper MIME type
    const dataUrl = `data:${file.mimetype};base64,${base64Image}`;
    
    return {
      dataUrl: dataUrl,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size
    };
  } catch (error) {
    console.error('Error processing image upload:', error);
    return null;
  }
};

// Helper function to get image URL (return data URL)
const getImageUrl = (imageData) => {
  if (!imageData) return null;
  
  // If imageData is a string (old format), return as is
  if (typeof imageData === 'string') {
    return imageData;
  }
  
  // If imageData is an object (new format), return the dataUrl
  if (imageData.dataUrl) {
    return imageData.dataUrl;
  }
  
  return null;
};

// Helper function to delete image file (no-op for base64 storage)
const deleteImage = (imageData) => {
  // For base64 storage, no file to delete
  // In the future, you might want to implement cleanup for cloud storage
  return;
};

module.exports = {
  upload,
  processImageUpload,
  getImageUrl,
  deleteImage
};
