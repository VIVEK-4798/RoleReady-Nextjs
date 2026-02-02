/**
 * Admin Skills Management Page
 * 
 * CRUD interface for managing skills.
 */

import connectDB from '@/lib/db/mongoose';
import { Skill } from '@/lib/models';
import SkillsPageClient from './SkillsPageClient';

export const metadata = {
  title: 'Manage Skills | Admin',
  description: 'Create, edit, and manage skills in the system',
};

async function getSkills() {
  await connectDB();

  const skills = await Skill.find()
    .sort({ name: 1 })
    .lean();

  return skills.map((skill) => ({
    _id: skill._id.toString(),
    name: skill.name,
    normalizedName: skill.normalizedName,
    domain: skill.domain,
    description: skill.description,
    isActive: skill.isActive,
    createdAt: skill.createdAt.toISOString(),
    updatedAt: skill.updatedAt.toISOString(),
  }));
}

export default async function AdminSkillsPage() {
  const skills = await getSkills();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Skills Management
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Create and manage the master skill list.
          </p>
        </div>
      </div>

      <SkillsPageClient initialSkills={skills} />
    </div>
  );
}
