/**
 * Seeder Utilities
 * 
 * Helper functions for database seeding operations.
 */

import mongoose from 'mongoose';
import Skill from '@/lib/models/Skill';
import Role from '@/lib/models/Role';
import type { Types } from 'mongoose';

/**
 * Connect to MongoDB
 */
export async function connectDatabase(): Promise<void> {
    try {
        const mongoUri = process.env.MONGODB_URI;

        if (!mongoUri) {
            throw new Error('MONGODB_URI environment variable is not defined');
        }

        if (mongoose.connection.readyState === 1) {
            console.log('✅ Already connected to MongoDB');
            return;
        }

        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        throw error;
    }
}

/**
 * Disconnect from MongoDB
 */
export async function disconnectDatabase(): Promise<void> {
    try {
        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
    } catch (error) {
        console.error('❌ MongoDB disconnection error:', error);
        throw error;
    }
}

/**
 * Normalize skill name for matching
 */
export function normalizeSkillName(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s\+\#\.\_\-]/g, '')
        .replace(/\s+/g, ' ');
}

/**
 * Find skill by normalized name
 */
export async function findSkillByName(name: string): Promise<typeof Skill.prototype | null> {
    const normalizedName = normalizeSkillName(name);
    return await Skill.findOne({ normalizedName });
}

/**
 * Find role by name
 */
export async function findRoleByName(name: string): Promise<typeof Role.prototype | null> {
    return await Role.findOne({ name: name.trim() });
}

/**
 * Get skill ID by name (throws if not found)
 */
export async function getSkillIdByName(name: string): Promise<Types.ObjectId> {
    const skill = await findSkillByName(name);

    if (!skill) {
        throw new Error(`Skill not found: ${name}`);
    }

    return skill._id as Types.ObjectId;
}

/**
 * Create a map of skill names to IDs
 */
export async function createSkillNameToIdMap(): Promise<Map<string, Types.ObjectId>> {
    const skills = await Skill.find({ isActive: true });
    const map = new Map<string, Types.ObjectId>();

    for (const skill of skills) {
        map.set(normalizeSkillName(skill.name), skill._id as Types.ObjectId);
    }

    return map;
}

/**
 * Log seeding progress
 */
export function logProgress(message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info'): void {
    const icons = {
        info: '🔵',
        success: '✅',
        error: '❌',
        warning: '⚠️',
    };

    console.log(`${icons[type]} ${message}`);
}

/**
 * Log seeding statistics
 */
export interface SeedStats {
    created: number;
    updated: number;
    skipped: number;
    errors: number;
}

export function logStats(entity: string, stats: SeedStats): void {
    console.log('\n' + '='.repeat(50));
    console.log(`📊 ${entity} Seeding Statistics`);
    console.log('='.repeat(50));
    console.log(`✅ Created: ${stats.created}`);
    console.log(`🔄 Updated: ${stats.updated}`);
    console.log(`⏭️  Skipped: ${stats.skipped}`);
    console.log(`❌ Errors:  ${stats.errors}`);
    console.log('='.repeat(50) + '\n');
}
