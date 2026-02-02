import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.model.js';
import connectDB from '../src/config/db.js';

// Load environment variables
dotenv.config();

/**
 * Script to create a librarian user
 * 
 * Usage:
 *   node scripts/create-librarian.js librarian@library.com librarian123 "Librarian Name"
 */

const createLibrarian = async () => {
  try {
    // Connect to database
    console.log('🔌 Connecting to MongoDB...');
    await connectDB();

    // Get arguments
    const librarianEmail = process.argv[2];
    const librarianPassword = process.argv[3];
    const librarianName = process.argv[4];

    if (!librarianEmail || !librarianPassword || !librarianName) {
      console.error('❌ Missing required arguments!');
      console.log('\n📖 Usage:');
      console.log('   node scripts/create-librarian.js <email> <password> <name>');
      console.log('\n📝 Example:');
      console.log('   node scripts/create-librarian.js librarian@library.com librarian123 "John Librarian"');
      await mongoose.connection.close();
      process.exit(1);
    }

    console.log('\n📝 Creating librarian user with:');
    console.log(`   Email: ${librarianEmail}`);
    console.log(`   Name: ${librarianName}`);
    console.log(`   Password: ${librarianPassword}\n`);

    // Check if user already exists
    const existing = await User.findOne({ email: librarianEmail });
    if (existing) {
      console.log('❌ User already exists with this email!');
      console.log(`   Role: ${existing.role}`);
      console.log(`   Active: ${existing.isActive}`);
      await mongoose.connection.close();
      process.exit(1);
    }

    // Create librarian user (password will be hashed automatically by User model pre-save hook)
    const librarian = await User.create({
      name: librarianName,
      email: librarianEmail,
      password: librarianPassword,
      role: 'librarian',
      isActive: true,
      isEmailVerified: false,
    });

    console.log('✅ Librarian user created successfully!');
    console.log('\n📋 User Details:');
    console.log(`   ID: ${librarian._id}`);
    console.log(`   Name: ${librarian.name}`);
    console.log(`   Email: ${librarian.email}`);
    console.log(`   Role: ${librarian.role}`);
    console.log(`   Active: ${librarian.isActive}`);
    console.log('\n🔑 You can now login with these credentials.');
    console.log('   Backend: POST http://localhost:5000/api/auth/login');
    console.log('   Frontend: http://localhost:5173/login\n');

    // Close database connection
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error creating librarian:', error.message);
    if (error.code === 11000) {
      console.error('   Duplicate email - user already exists');
    }
    await mongoose.connection.close().catch(() => {});
    process.exit(1);
  }
};

// Run the script
createLibrarian();
