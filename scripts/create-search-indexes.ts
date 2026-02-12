/**
 * Database Index Creation Script
 * 
 * Run this script to create optimal indexes for the recipient search feature.
 * This will significantly improve search performance for thousands of users.
 * 
 * Usage:
 *   npx tsx scripts/create-search-indexes.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import mongoose from 'mongoose';
import User from '../lib/models/User';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

async function createSearchIndexes() {
    try {
        const MONGODB_URI = process.env.MONGODB_URI;

        if (!MONGODB_URI) {
            throw new Error('MONGODB_URI not found in environment variables');
        }

        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        console.log('📊 Creating search indexes...\n');

        // Index 1: Compound index for role + name + email
        console.log('Creating compound index (role + name + email)...');
        await User.collection.createIndex(
            { role: 1, name: 1, email: 1 },
            { name: 'role_name_email_search' }
        );
        console.log('✅ Compound index created\n');

        // Index 2: Text index for full-text search (optional but recommended)
        console.log('Creating text index (name + email)...');
        await User.collection.createIndex(
            { name: 'text', email: 'text' },
            {
                name: 'name_email_text_search',
                weights: { name: 2, email: 1 } // Name is more important than email
            }
        );
        console.log('✅ Text index created\n');

        // List all indexes
        console.log('📋 Current indexes on User collection:');
        const indexes = await User.collection.indexes();
        indexes.forEach((index, i) => {
            console.log(`${i + 1}. ${index.name}:`, JSON.stringify(index.key));
        });

        console.log('\n✅ All indexes created successfully!');
        console.log('\n💡 Benefits:');
        console.log('   - Faster user/mentor search queries');
        console.log('   - Reduced database load');
        console.log('   - Better performance with thousands of users');
        console.log('   - Optimized regex searches\n');

    } catch (error) {
        console.error('❌ Error creating indexes:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// Run the script
createSearchIndexes()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
