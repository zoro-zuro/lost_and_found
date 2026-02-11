/**
 * Database Migration Instructions
 * 
 * This script updates existing LostItems to have proper publishStatus and reviewStatus
 * so they appear in public listings after model changes.
 * 
 * INSTRUCTIONS:
 * 
 * 1. Make sure MongoDB is running (your app is already connected)
 * 2. Run this script using Node.js
 * 3. Check the output for success confirmation
 * 
 * The migration will:
 * - Update all LostItems with publishStatus: 'PUBLISHED' and reviewStatus: 'APPROVED'
 * - Leave FoundItems unchanged (different model structure)
 * 
 * Run this after updating the models to ensure existing items are visible.
 */

const mongoose = require('mongoose');
const LostItem = require('./src/models/LostItem');

// Load environment variables from root directory (same as main server)
require('dotenv').config({ path: '../.env' });

// Use the same MongoDB connection as your running app
// Note: Your main server uses MONGO_URI, not MONGODB_URI
const MONGODB_URI = process.env.MONGO_URI || 'mongodb+srv://your-atlas-connection-string';

async function migrateItems() {
  try {
    console.log('🔄 Starting database migration...');
    console.log('📊 MongoDB URI:', MONGODB_URI);
    
    // Connect to database
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully');
    
    // Update Lost Items
    console.log('📝 Updating Lost Items...');
    const lostResult = await LostItem.updateMany(
      { 
        $or: [
          { publishStatus: { $exists: false } },
          { reviewStatus: { $exists: false } }
        ]
      },
      { 
        $set: { 
          publishStatus: 'PUBLISHED',
          reviewStatus: 'APPROVED'
        }
      }
    );
    
    console.log(`✅ Updated ${lostResult.modifiedCount} Lost Items to PUBLISHED status`);
    
    // Found Items don't need migration (different model structure)
    console.log('ℹ️ Found Items do not need migration (different model structure)');
    
    console.log('🎉 Migration completed successfully!');
    
    // Close connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateItems();
}

module.exports = { migrateItems };
