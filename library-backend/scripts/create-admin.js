import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.model.js';
import connectDB from '../src/config/db.js';

// Load environment variables
dotenv.config();

/**
 * Script to create the first admin user
 * 
 * Usage:
 *   node scripts/create-admin.js
 *   node scripts/create-admin.js admin@library.com admin123456 "Admin Name"
 */

const createAdmin = async () => {
  try {
    // Connect to database
    console.log('🔌 Connecting to MongoDB...');
    await connectDB();

    // Get arguments or use defaults
    const adminEmail = process.argv[2] || 'admin@library.com';
    const adminPassword = process.argv[3] || 'admin123456';
    const adminName = process.argv[4] || 'System Admin';

    console.log('\n📝 Creating admin user with:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Name: ${adminName}`);
    console.log(`   Password: ${adminPassword}\n`);

    // Check if admin already exists
    const existing = await User.findOne({ email: adminEmail });
    if (existing) {
      console.log('❌ User already exists with this email!');
      console.log(`   Role: ${existing.role}`);
      console.log(`   Active: ${existing.isActive}`);
      console.log('\n💡 To create a different admin, use:');
      console.log('   node scripts/create-admin.js <email> <password> <name>');
      await mongoose.connection.close();
      process.exit(1);
    }

    // Create admin user (password will be hashed automatically by User model pre-save hook)
    const admin = await User.create({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      isActive: true,
      isEmailVerified: false,
    });

    console.log('✅ Admin user created successfully!');
    console.log('\n📋 User Details:');
    console.log(`   ID: ${admin._id}`);
    console.log(`   Name: ${admin.name}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   Active: ${admin.isActive}`);
    console.log('\n🔑 You can now login with these credentials.');
    console.log('   Backend: POST http://localhost:5000/api/auth/login');
    console.log('   Frontend: http://localhost:5173/login\n');

    // Close database connection
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error creating admin:', error.message);
    if (error.code === 11000) {
      console.error('   Duplicate email - user already exists');
    }
    await mongoose.connection.close().catch(() => {});
    process.exit(1);
  }
};

// Run the script
createAdmin();
