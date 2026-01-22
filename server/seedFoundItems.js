require('dotenv').config();
const mongoose = require('mongoose');
const FoundItem = require('./src/models/FoundItem');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

const foundItems = [
  // ID Cards
  {
    itemName: 'Student ID Card - BIT Department',
    category: 'ID Card',
    dateFound: new Date('2026-01-20'),
    locationFound: 'Library (60,000 volumes)',
    description: 'Found a blue student ID card with photo on the second floor of the library near the computer section. The card has AMC logo and belongs to BIT department. Name partially visible starting with "Raj".',
  },
  {
    itemName: 'Staff ID Badge',
    category: 'ID Card',
    dateFound: new Date('2026-01-19'),
    locationFound: 'Main Hall (Principal, VP, COE, Bursar, Dean Offices, Assembly Hall)',
    description: 'Purple colored staff ID badge found near the Assembly Hall entrance. Has a lanyard attached. Badge number visible but keeping confidential for security.',
  },
  {
    itemName: 'College ID Card - Female Student',
    category: 'ID Card',
    dateFound: new Date('2026-01-18'),
    locationFound: 'College Canteen / RR Canteen',
    description: 'Student ID card found on a table in RR Canteen. Light blue card with student photo. Department appears to be Commerce. Card is in good condition.',
  },

  // Phones
  {
    itemName: 'Samsung Galaxy A54 - Blue',
    category: 'Phone',
    dateFound: new Date('2026-01-21'),
    locationFound: 'Basketball Court (Flood-lit)',
    description: 'Blue Samsung phone found near the basketball court benches. Phone has a clear protective case. Screen is locked with pattern. Battery was at 15% when found.',
  },
  {
    itemName: 'iPhone 13 - Black',
    category: 'Phone',
    dateFound: new Date('2026-01-20'),
    locationFound: 'Washburn Hall (Boys Hostel - Freshers)',
    description: 'Black iPhone 13 found in the common room. Phone has a dark blue case with a small sticker on the back. Device is password protected. Found charging near the study area.',
  },
  {
    itemName: 'Redmi Note 12 - White',
    category: 'Phone',
    dateFound: new Date('2026-01-17'),
    locationFound: 'Paul Linder Love Hall (MCA, MSc Data Science, CS/IT/BCA, COE)',
    description: 'White Redmi phone with cracked screen protector found in computer lab 3. Phone has a pop socket on the back. Several missed calls when found.',
  },

  // Wallets
  {
    itemName: 'Brown Leather Wallet',
    category: 'Wallet',
    dateFound: new Date('2026-01-22'),
    locationFound: 'Parking Lot',
    description: 'Brown leather bi-fold wallet found near the bike parking area. Contains some cards but no cash. Has a small keychain attached. Appears well-used.',
  },
  {
    itemName: 'Black Wallet - Student',
    category: 'Wallet',
    dateFound: new Date('2026-01-21'),
    locationFound: 'Gym',
    description: 'Black fabric wallet found in the gym locker area. Contains student bus pass and library card. Wallet has a zipper compartment. AMC student ID visible inside.',
  },
  {
    itemName: 'Red Ladies Purse',
    category: 'Wallet',
    dateFound: new Date('2026-01-19'),
    locationFound: "Women's Hall (Girls Hostel)",
    description: 'Small red purse wallet found in the mess hall. Has multiple card slots and a coin pouch. Contains some personal items and receipts.',
  },

  // Bags
  {
    itemName: 'Blue Jansport Backpack',
    category: 'Bag',
    dateFound: new Date('2026-01-21'),
    locationFound: 'New Building (Management, CS, Social Work, Commerce, SCILET, Seminar Hall)',
    description: 'Navy blue Jansport backpack found in the seminar hall. Contains notebooks, pens, and a water bottle. Has a small AMC keychain attached to the zipper.',
  },
  {
    itemName: 'Black Laptop Bag',
    category: 'Bag',
    dateFound: new Date('2026-01-20'),
    locationFound: 'James Hall (Physics, Chemistry, Documentation Centre, PG Physics, DAS)',
    description: 'Professional black laptop bag found near the physics lab. Contains laptop charger and some stationery. Bag has padded compartments and looks relatively new.',
  },
  {
    itemName: 'Gray Sports Duffel Bag',
    category: 'Bag',
    dateFound: new Date('2026-01-18'),
    locationFound: 'Playground (Football, Cricket, Hockey, Athletics)',
    description: 'Gray Nike duffel bag found near the football field. Contains sports clothes, a towel, and a water bottle. Has a name tag but text is faded.',
  },

  // Keys
  {
    itemName: 'Bike Key with Red Keychain',
    category: 'Keys',
    dateFound: new Date('2026-01-22'),
    locationFound: 'Main Gate / Washburn Gate',
    description: 'Honda bike key with a red plastic keychain found near the main gate. Keychain has a small photo frame attachment (photo removed for privacy).',
  },
  {
    itemName: 'Room Keys - 3 Keys on Ring',
    category: 'Keys',
    dateFound: new Date('2026-01-21'),
    locationFound: 'Dudley Hall (Boys Hostel)',
    description: 'Set of three keys on a metal ring. Appears to be hostel room keys. Found in the corridor near the study room. One key has a number tag.',
  },
  {
    itemName: 'Car Key - Toyota',
    category: 'Keys',
    dateFound: new Date('2026-01-19'),
    locationFound: 'Parking Lot',
    description: 'Toyota car key with remote found in the parking lot. Key has some scratches and a small AMC sticker on the remote.',
  },

  // Books
  {
    itemName: 'Data Structures Textbook',
    category: 'Book',
    dateFound: new Date('2026-01-21'),
    locationFound: 'Library (60,000 volumes)',
    description: 'Computer Science textbook - Data Structures and Algorithms in C++. Has student name written inside the cover. Book has highlighting and notes throughout.',
  },
  {
    itemName: 'Engineering Mathematics Notebook',
    category: 'Book',
    dateFound: new Date('2026-01-20'),
    locationFound: 'Mathematics Hall',
    description: 'Spiral bound notebook for Engineering Mathematics. Contains handwritten notes and solved problems. Name visible on first page.',
  },
  {
    itemName: 'Tamil Novel',
    category: 'Book',
    dateFound: new Date('2026-01-18'),
    locationFound: 'Tamil Department',
    description: 'Tamil language novel found on a desk. Book has a bookmark at page 150. Cover shows some wear but book is in readable condition.',
  },

  // Electronics
  {
    itemName: 'Black Wireless Earbuds',
    category: 'Electronics',
    dateFound: new Date('2026-01-22'),
    locationFound: 'Tennis Court',
    description: 'Black wireless earbuds (appears to be boat brand) found near the tennis court. Comes with charging case. Case has 50% battery remaining.',
  },
  {
    itemName: 'White Apple AirPods',
    category: 'Electronics',
    dateFound: new Date('2026-01-21'),
    locationFound: 'College Canteen / RR Canteen',
    description: 'Apple AirPods (3rd generation) in white charging case found on a canteen table. Case has a small scratch on the lid. Both earbuds present.',
  },
  {
    itemName: 'Smart Watch - Fitbit',
    category: 'Electronics',
    dateFound: new Date('2026-01-20'),
    locationFound: 'Gym',
    description: 'Black Fitbit smartwatch found on the treadmill area. Watch has some fitness data stored. Strap is adjustable and in good condition.',
  },
  {
    itemName: 'USB Flash Drive - 32GB',
    category: 'Electronics',
    dateFound: new Date('2026-01-19'),
    locationFound: 'Paul Linder Love Hall (MCA, MSc Data Science, CS/IT/BCA, COE)',
    description: 'SanDisk 32GB USB drive found in computer lab. Drive has a label "Project Files". Not accessed for security reasons.',
  },

  // Other Items
  {
    itemName: 'Prescription Glasses',
    category: 'Other',
    dateFound: new Date('2026-01-22'),
    locationFound: 'Auditorium',
    description: 'Black rectangular frame prescription glasses found on a seat in the auditorium. Glasses are in a black hard case. Lenses appear to be for nearsightedness.',
  },
  {
    itemName: 'Silver Wrist Watch',
    category: 'Other',
    dateFound: new Date('2026-01-21'),
    locationFound: 'Volleyball Court',
    description: 'Silver colored wrist watch with leather strap found near the volleyball court. Watch is still working. Has some engraving on the back (details withheld).',
  },
  {
    itemName: 'Blue Water Bottle',
    category: 'Other',
    dateFound: new Date('2026-01-20'),
    locationFound: 'Binghamton Hall (Zoology, Botany, Biochemistry)',
    description: '1 liter blue Milton water bottle found in the biochemistry lab. Bottle has stickers of various bands. Name written on the bottom in permanent marker.',
  },
  {
    itemName: 'Black Umbrella',
    category: 'Other',
    dateFound: new Date('2026-01-19'),
    locationFound: 'Main Hall (Principal, VP, COE, Bursar, Dean Offices, Assembly Hall)',
    description: 'Large black umbrella found near the main hall entrance. Automatic open/close mechanism. Handle is slightly worn but functional.',
  },
  {
    itemName: 'Scientific Calculator - Casio',
    category: 'Electronics',
    dateFound: new Date('2026-01-18'),
    locationFound: 'Jones Hall (Examination Hall)',
    description: 'Casio fx-991EX scientific calculator found after an exam. Has a name sticker on the back. Calculator is in working condition with fresh batteries.',
  },
  {
    itemName: 'Lunch Box - Stainless Steel',
    category: 'Other',
    dateFound: new Date('2026-01-17'),
    locationFound: 'College Canteen / RR Canteen',
    description: 'Three-tier stainless steel lunch box found on a canteen table. Has some food remnants. Box has a name label but text is smudged.',
  },
];

const seedFoundItems = async () => {
  try {
    await connectDB();
    
    // Clear existing found items
    await FoundItem.deleteMany({});
    console.log('🗑️  Cleared existing found items');

    // Insert seed data
    const inserted = await FoundItem.insertMany(foundItems);
    console.log(`✅ Successfully seeded ${inserted.length} found items`);
    
    console.log('\n📊 Summary by Category:');
    const categories = await FoundItem.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    categories.forEach(cat => {
      console.log(`   ${cat._id}: ${cat.count} items`);
    });

    console.log('\n✨ Seed data populated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
    process.exit(1);
  }
};

seedFoundItems();
