const mongoose = require('mongoose');
const LostItem = require('./src/models/LostItem');
const FoundItem = require('./src/models/FoundItem');

/**
 * Migration script to update existing items with proper publishStatus and reviewStatus
 * This ensures all existing items are visible after model changes
 */

async function migrateItems() {
  try {
    console.log('Starting migration for existing items...');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lost-and-found');
    
    // Update Lost Items
    console.log('Updating Lost Items...');
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
    
    console.log(`Updated ${lostResult.modifiedCount} Lost Items`);
    
    // Update Found Items (no changes needed for FoundItems)
    console.log('Found Items do not need migration (different model structure)');
    
    console.log('Migration completed successfully!');
    
    // Close connection
    await mongoose.connection.close();
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
migrateItems();
