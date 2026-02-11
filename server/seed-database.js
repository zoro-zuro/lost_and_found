require('dotenv').config({ path: '../.env' });

const mongoose = require('mongoose');
const LostItem = require('./src/models/LostItem');
const FoundItem = require('./src/models/FoundItem');
const User = require('./src/models/User');

// Sample image URLs (these would be actual uploaded images)
const sampleImages = [
  'https://picsum.photos/seed/lost1/400/300',
  'https://picsum.photos/seed/lost2/400/300',
  'https://picsum.photos/seed/lost3/400/300',
  'https://picsum.photos/seed/found1/400/300',
  'https://picsum.photos/seed/found2/400/300',
  'https://picsum.photos/seed/found3/400/300'
];

const categories = [
  'ID Card', 'Phone', 'Wallet', 'Bag', 'Keys', 'Book', 'Electronics', 'Other'
];

const locations = [
  'main-hall', 'james-hall', 'wallace-hall', 'ladies-hostel',
  'college-canteen', 'library', 'main-gate', 'playground', 'other'
];

const brands = ['Apple', 'Samsung', 'Nike', 'Adidas', 'Sony', 'Dell', 'HP', 'Canon', 'Ray-Ban'];

const colors = ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Silver', 'Gold', 'Pink', 'Purple'];

const descriptions = {
  lost: [
    'Lost my phone during morning class, has black case with small crack on corner',
    'Misplaced my wallet near the library, contains student ID and credit cards',
    'Left my laptop bag in the cafeteria, contains Dell laptop and charger',
    'Lost my silver watch near the sports ground, has leather strap',
    'Misplaced my keys near the main gate, includes car key and room key',
    'Lost my textbook in James Hall during physics lecture',
    'Left my water bottle at the playground during basketball practice',
    'Lost my glasses in the library while studying',
    'Misplaced my backpack containing laptop and notebooks',
    'Lost my student ID card near the college canteen'
  ],
  found: [
    'Found a black phone with cracked screen near main hall',
    'Found a brown wallet containing cash and ID cards near library',
    'Found a laptop bag with Dell laptop and charger in cafeteria',
    'Found a silver watch with leather strap near sports ground',
    'Found a set of keys including car key near main gate',
    'Found a physics textbook in James Hall',
    'Found a blue water bottle at the playground',
    'Found prescription glasses in the library',
    'Found a black backpack with laptop and notebooks',
    'Found a student ID card near the college canteen'
  ]
};

// Generate random data
function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomDate(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  return date.toISOString().split('T')[0];
}

async function createTestUser() {
  try {
    let testUser = await User.findOne({ email: '23bit001@americancollege.edu.in' });
    
    if (!testUser) {
      testUser = await User.create({
        name: 'Random Test User',
        email: '23bit001@americancollege.edu.in', // AMC college email format
        password: '$2a$10$abcdefghijklmnopqrstuv', // hashed password
        role: 'STUDENT',
        isApproved: true,
        isVerified: true,
        verificationToken: null,
        verificationExpires: null,
        emailNotificationsEnabled: true,
        notifyScope: 'all',
        // Required fields for User model
        institutionalId: 'STD2024001', // Required field
        department: 'Computer Science', // Required field  
        block: 'A-Block', // Required field
        phone: '+1234567890', // Optional field
        altPhone: '+0987654321' // Optional field
      });
      console.log('✅ Created test user:', testUser._id);
    }
    
    return testUser;
  } catch (error) {
    console.error('❌ Error creating test user:', error);
    return null;
  }
}

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Create test user if not exists
    const testUser = await createTestUser();
    if (!testUser) {
      console.log('❌ Failed to create test user');
      return;
    }
    
    // Clear existing data
    await LostItem.deleteMany({});
    await FoundItem.deleteMany({});
    console.log('🧹 Cleared existing data');
    
    // Seed Lost Items (32 items)
    const lostItems = [];
    for (let i = 0; i < 32; i++) {
      const isPublic = Math.random() < 0.8; // 80% public, 20% admin only
      
      lostItems.push({
        userId: testUser._id,
        itemName: `Lost Item ${i + 1}`,
        category: getRandomItem(categories),
        dateLost: getRandomDate(30), // Within last 30 days
        locationLost: getRandomItem(locations),
        description: getRandomItem(descriptions.lost),
        color: getRandomItem(colors),
        brand: getRandomItem(brands),
        uniqueMark: `Unique mark ${i + 1} - scratch on corner`,
        contactPhone: `+123456789${String(i).padStart(2, '0')}`,
        imageUrl: getRandomItem(sampleImages),
        visibility: isPublic ? 'PUBLIC' : 'ADMIN_ONLY',
        publishStatus: 'PUBLISHED',
        reviewStatus: 'APPROVED',
        notifyRequested: Math.random() < 0.5,
        status: 'OPEN'
      });
    }
    
    const createdLostItems = await LostItem.insertMany(lostItems);
    console.log(`✅ Created ${createdLostItems.length} Lost Items`);
    
    // Seed Found Items (32 items)
    const foundItems = [];
    for (let i = 0; i < 32; i++) {
      const isPublic = Math.random() < 0.8; // 80% public, 20% admin only
      
      foundItems.push({
        userId: testUser._id,
        itemName: `Found Item ${i + 1}`,
        category: getRandomItem(categories),
        dateFound: getRandomDate(15), // Within last 15 days
        locationFound: getRandomItem(locations),
        description: getRandomItem(descriptions.found),
        color: getRandomItem(colors),
        brand: getRandomItem(brands),
        imageUrl: getRandomItem(sampleImages),
        visibility: isPublic ? 'PUBLIC' : 'ADMIN_ONLY',
        status: 'OPEN',
        reportedBy: testUser._id
      });
    }
    
    const createdFoundItems = await FoundItem.insertMany(foundItems);
    console.log(`✅ Created ${createdFoundItems.length} Found Items`);
    
    // Statistics
    const publicLostItems = createdLostItems.filter(item => item.visibility === 'PUBLIC').length;
    const adminLostItems = createdLostItems.filter(item => item.visibility === 'ADMIN_ONLY').length;
    const publicFoundItems = createdFoundItems.filter(item => item.visibility === 'PUBLIC').length;
    const adminFoundItems = createdFoundItems.filter(item => item.visibility === 'ADMIN_ONLY').length;
    
    console.log('\n📊 SEEDING STATISTICS:');
    console.log(`📱 Lost Items: ${createdLostItems.length} total`);
    console.log(`   🌍 Public: ${publicLostItems} (${Math.round(publicLostItems/createdLostItems.length*100)}%)`);
    console.log(`   🔒 Admin Only: ${adminLostItems} (${Math.round(adminLostItems/createdLostItems.length*100)}%)`);
    console.log(`📦 Found Items: ${createdFoundItems.length} total`);
    console.log(`   🌍 Public: ${publicFoundItems} (${Math.round(publicFoundItems/createdFoundItems.length*100)}%)`);
    console.log(`   🔒 Admin Only: ${adminFoundItems} (${Math.round(adminFoundItems/createdFoundItems.length*100)}%)`);
    console.log(`👤 Test User: ${testUser.name} (${testUser.email})`);
    console.log('\n🎉 Database seeding completed successfully!');
    
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
