/**
 * Skills Admin API
 * GET /api/skills/admin - Get skill statistics
 * POST /api/skills/admin - Seed common skills
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import Skill from '@/lib/models/Skill';
import { success, errors, handleError } from '@/lib/utils/api';
import { auth } from '@/lib/auth';

const COMMON_SKILLS = [
  { name: 'React', domain: 'frameworks' },
  { name: 'React.js', domain: 'frameworks' },
  { name: 'Next.js', domain: 'frameworks' },
  { name: 'React Native', domain: 'frameworks' },
  { name: 'Node.js', domain: 'frameworks' },
  { name: 'Express', domain: 'frameworks' },
  { name: 'Express.js', domain: 'frameworks' },
  { name: 'JavaScript', domain: 'languages' },
  { name: 'TypeScript', domain: 'languages' },
  { name: 'Python', domain: 'languages' },
  { name: 'Java', domain: 'languages' },
  { name: 'Go', domain: 'languages' },
  { name: 'MongoDB', domain: 'databases' },
  { name: 'SQL', domain: 'databases' },
  { name: 'PostgreSQL', domain: 'databases' },
  { name: 'MySQL', domain: 'databases' },
  { name: 'Firebase', domain: 'databases' },
  { name: 'Appwrite', domain: 'cloud' },
  { name: 'Mongoose', domain: 'databases' },
  { name: 'Tailwind CSS', domain: 'frameworks' },
  { name: 'Material UI', domain: 'frameworks' },
  { name: 'Git', domain: 'tools' },
  { name: 'GitHub', domain: 'tools' },
  { name: 'Postman', domain: 'tools' },
  { name: 'Vercel', domain: 'cloud' },
  { name: 'Razorpay', domain: 'tools' },
  { name: 'Google Analytics', domain: 'tools' },
  { name: 'Expo', domain: 'frameworks' },
  { name: 'REST API', domain: 'technical' },
  { name: 'GraphQL', domain: 'technical' },
  { name: 'Docker', domain: 'tools' },
  { name: 'AWS', domain: 'cloud' },
  { name: 'Azure', domain: 'cloud' },
  { name: 'HTML', domain: 'technical' },
  { name: 'CSS', domain: 'technical' },
  { name: 'Sass', domain: 'tools' },
  { name: 'Redux', domain: 'frameworks' },
  { name: 'Vue.js', domain: 'frameworks' },
  { name: 'Angular', domain: 'frameworks' },
];

/**
 * GET /api/skills/admin
 * Get skill statistics
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return errors.unauthorized();
    }

    await connectDB();

    const totalSkills = await Skill.countDocuments();
    const byDomain = await Skill.aggregate([
      { $group: { _id: '$domain', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get a sample of skills
    const sampleSkills = await Skill.find({})
      .limit(20)
      .select('name domain normalizedName')
      .lean();

    return success({
      totalSkills,
      byDomain,
      sampleSkills,
      message: totalSkills === 0 ? 'No skills in database. Run POST to seed skills.' : 'Skills loaded',
    });

  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/skills/admin
 * Seed common skills into database
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return errors.unauthorized();
    }

    const sessionUser = session.user as { role?: string };
    if (sessionUser.role !== 'admin') {
      return errors.forbidden('Only admins can seed skills');
    }

    await connectDB();

    let addedCount = 0;
    let skippedCount = 0;
    const added: string[] = [];
    const skipped: string[] = [];

    for (const skillData of COMMON_SKILLS) {
      try {
        const normalizedName = skillData.name
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, '')
          .replace(/\s+/g, ' ')
          .trim();

        const existing = await Skill.findOne({ normalizedName });

        if (existing) {
          skippedCount++;
          skipped.push(skillData.name);
        } else {
          await Skill.create(skillData);
          addedCount++;
          added.push(skillData.name);
        }
      } catch (error: any) {
        if (error.code === 11000) {
          skippedCount++;
          skipped.push(skillData.name);
        } else {
          console.error(`Error adding ${skillData.name}:`, error.message);
        }
      }
    }

    const totalSkills = await Skill.countDocuments();

    return success({
      added: addedCount,
      skipped: skippedCount,
      totalSkills,
      addedSkills: added.slice(0, 10), // First 10 added
      message: `Successfully seeded ${addedCount} skills. ${skippedCount} already existed.`,
    }, 'Skills seeded successfully', 201);

  } catch (error) {
    return handleError(error);
  }
}
