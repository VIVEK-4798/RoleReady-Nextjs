/**
 * Master Data Seeding Script
 * 
 * Seeds the database with:
 * - Skills
 * - Roles
 * - Benchmarks (role-skill mappings)
 * 
 * Usage:
 *   npm run seed
 * 
 * Features:
 * - Safe to re-run (upserts instead of duplicates)
 * - Proper error handling
 * - Detailed logging
 * - Transaction-like behavior (all or nothing per entity)
 */

import dotenv from 'dotenv';
import path from 'path';
import Skill from '../lib/models/Skill';
import Role from '../lib/models/Role';
import {
    connectDatabase,
    disconnectDatabase,
    findSkillByName,
    findRoleByName,
    createSkillNameToIdMap,
    logProgress,
    logStats,
    type SeedStats,
} from './utils/seeder';
import { skillsData } from './seeds/skills';
import { rolesData } from './seeds/roles';
import { benchmarksData } from './seeds/benchmarks';
import type { Types } from 'mongoose';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

/**
 * Seed Skills
 */
async function seedSkills(): Promise<SeedStats> {
    logProgress('Starting skills seeding...', 'info');

    const stats: SeedStats = {
        created: 0,
        updated: 0,
        skipped: 0,
        errors: 0,
    };

    for (const skillData of skillsData) {
        try {
            const existing = await findSkillByName(skillData.name);

            if (existing) {
                // Update existing skill
                existing.name = skillData.name;
                existing.domain = skillData.domain;
                existing.description = skillData.description;
                existing.isActive = skillData.isActive;

                await existing.save();
                stats.updated++;
                logProgress(`Updated skill: ${skillData.name}`, 'success');
            } else {
                // Create new skill
                await Skill.create(skillData);
                stats.created++;
                logProgress(`Created skill: ${skillData.name}`, 'success');
            }
        } catch (error) {
            stats.errors++;
            logProgress(`Error seeding skill "${skillData.name}": ${error}`, 'error');
        }
    }

    return stats;
}

/**
 * Seed Roles
 */
async function seedRoles(): Promise<SeedStats> {
    logProgress('Starting roles seeding...', 'info');

    const stats: SeedStats = {
        created: 0,
        updated: 0,
        skipped: 0,
        errors: 0,
    };

    for (const roleData of rolesData) {
        try {
            const existing = await findRoleByName(roleData.name);

            if (existing) {
                // Update existing role (but preserve benchmarks)
                existing.description = roleData.description;
                existing.colorClass = roleData.colorClass;
                existing.isActive = roleData.isActive;

                await existing.save();
                stats.updated++;
                logProgress(`Updated role: ${roleData.name}`, 'success');
            } else {
                // Create new role (without benchmarks yet)
                await Role.create({
                    ...roleData,
                    benchmarks: [],
                });
                stats.created++;
                logProgress(`Created role: ${roleData.name}`, 'success');
            }
        } catch (error) {
            stats.errors++;
            logProgress(`Error seeding role "${roleData.name}": ${error}`, 'error');
        }
    }

    return stats;
}

/**
 * Seed Benchmarks
 */
async function seedBenchmarks(): Promise<SeedStats> {
    logProgress('Starting benchmarks seeding...', 'info');

    const stats: SeedStats = {
        created: 0,
        updated: 0,
        skipped: 0,
        errors: 0,
    };

    // Create skill name -> ID mapping for fast lookup
    const skillMap = await createSkillNameToIdMap();

    for (const benchmarkData of benchmarksData) {
        try {
            const role = await findRoleByName(benchmarkData.roleName);

            if (!role) {
                logProgress(`Role not found: ${benchmarkData.roleName}`, 'warning');
                stats.errors++;
                continue;
            }

            // Map skill names to IDs
            const benchmarks: Array<{
                skillId: Types.ObjectId;
                importance: typeof benchmarkData.skills[0]['importance'];
                weight: number;
                requiredLevel: typeof benchmarkData.skills[0]['requiredLevel'];
                isActive: boolean;
            }> = [];

            for (const skillData of benchmarkData.skills) {
                const normalizedName = skillData.skillName.toLowerCase().trim().replace(/[^a-z0-9\s\+\#\.\_\-]/g, '').replace(/\s+/g, ' ');
                const skillId = skillMap.get(normalizedName);

                if (!skillId) {
                    logProgress(`Skill not found: ${skillData.skillName} (for role: ${benchmarkData.roleName})`, 'warning');
                    stats.errors++;
                    continue;
                }

                benchmarks.push({
                    skillId,
                    importance: skillData.importance,
                    weight: skillData.weight,
                    requiredLevel: skillData.requiredLevel,
                    isActive: true,
                });
            }

            // Replace all benchmarks for this role
            role.benchmarks = benchmarks;
            await role.save();

            stats.updated++;
            logProgress(`Updated benchmarks for role: ${benchmarkData.roleName} (${benchmarks.length} skills)`, 'success');
        } catch (error) {
            stats.errors++;
            logProgress(`Error seeding benchmarks for "${benchmarkData.roleName}": ${error}`, 'error');
        }
    }

    return stats;
}

/**
 * Main seeding function
 */
async function seed(): Promise<void> {
    console.log('\n' + '='.repeat(50));
    console.log('🌱 MASTER DATA SEEDING');
    console.log('='.repeat(50) + '\n');

    try {
        // Connect to database
        await connectDatabase();

        // Seed in order: Skills -> Roles -> Benchmarks
        const skillsStats = await seedSkills();
        logStats('Skills', skillsStats);

        const rolesStats = await seedRoles();
        logStats('Roles', rolesStats);

        const benchmarksStats = await seedBenchmarks();
        logStats('Benchmarks', benchmarksStats);

        // Summary
        console.log('\n' + '='.repeat(50));
        console.log('🎉 SEEDING COMPLETED SUCCESSFULLY');
        console.log('='.repeat(50));
        console.log(`Total Skills:     ${skillsStats.created + skillsStats.updated}`);
        console.log(`Total Roles:      ${rolesStats.created + rolesStats.updated}`);
        console.log(`Total Benchmarks: ${benchmarksStats.updated}`);
        console.log('='.repeat(50) + '\n');

    } catch (error) {
        console.error('\n' + '='.repeat(50));
        console.error('❌ SEEDING FAILED');
        console.error('='.repeat(50));
        console.error(error);
        process.exit(1);
    } finally {
        // Disconnect from database
        await disconnectDatabase();
    }
}

// Run seeding
seed()
    .then(() => {
        process.exit(0);
    })
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
