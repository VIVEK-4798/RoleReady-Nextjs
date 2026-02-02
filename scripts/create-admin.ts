/**
 * Admin Account Creation Script
 * 
 * Usage:
 *   npm run create-admin
 * 
 * This script creates an admin user account. You'll be prompted to enter
 * the admin's credentials. If an admin account already exists with the
 * provided email, the script will fail.
 * 
 * Security Note: This script should only be run locally by authorized personnel.
 */

import * as readline from 'readline';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Load environment variables
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Use process.cwd() instead of __dirname (which doesn't exist in ES modules)
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

// MongoDB URI
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ Error: MONGODB_URI not found in environment variables');
  process.exit(1);
}

// User Schema (simplified version for this script)
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'mentor', 'admin'], default: 'user' },
  mobile: String,
  isActive: { type: Boolean, default: true },
  profile: { type: Object, default: {} },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

// Readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function createAdmin() {
  try {
    console.log('\n🔧 RoleReady Admin Account Creator\n');
    console.log('This script will create a new admin account.\n');

    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI!);
    console.log('✅ Connected to MongoDB\n');

    // Get admin details
    const name = await question('Admin Name: ');
    if (!name.trim()) {
      console.error('❌ Error: Name cannot be empty');
      process.exit(1);
    }

    const email = await question('Admin Email: ');
    if (!email.trim()) {
      console.error('❌ Error: Email cannot be empty');
      process.exit(1);
    }

    // Validate email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      console.error('❌ Error: Invalid email format');
      process.exit(1);
    }

    // Check if user with this email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.error(`❌ Error: User with email "${email}" already exists`);
      console.log(`   Current role: ${existingUser.role}`);
      process.exit(1);
    }

    const password = await question('Admin Password (min 6 characters): ');
    if (password.length < 6) {
      console.error('❌ Error: Password must be at least 6 characters');
      process.exit(1);
    }

    const confirmPassword = await question('Confirm Password: ');
    if (password !== confirmPassword) {
      console.error('❌ Error: Passwords do not match');
      process.exit(1);
    }

    const mobile = await question('Mobile Number (optional, press Enter to skip): ');

    // Confirm creation
    console.log('\n📋 Admin Account Details:');
    console.log(`   Name:  ${name}`);
    console.log(`   Email: ${email}`);
    console.log(`   Role:  admin`);
    if (mobile) console.log(`   Mobile: ${mobile}`);

    const confirm = await question('\nCreate this admin account? (yes/no): ');
    if (confirm.toLowerCase() !== 'yes') {
      console.log('❌ Admin creation cancelled');
      process.exit(0);
    }

    // Hash password
    console.log('\n🔐 Hashing password...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create admin user
    console.log('👤 Creating admin account...');
    const admin = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: 'admin',
      mobile: mobile?.trim() || undefined,
      isActive: true,
      profile: {},
    });

    await admin.save();

    console.log('\n✅ Admin account created successfully!');
    console.log('\n📧 Login Credentials:');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: [the password you entered]`);
    console.log('\n🚀 You can now login at: http://localhost:3000/login\n');

  } catch (error) {
    console.error('\n❌ Error creating admin:', error);
    process.exit(1);
  } finally {
    rl.close();
    await mongoose.disconnect();
  }
}

// Run the script
createAdmin();
