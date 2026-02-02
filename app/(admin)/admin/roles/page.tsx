/**
 * Roles Management Page (Server Component)
 * 
 * Admin page to manage roles and their benchmarks.
 */

import connectDB from '@/lib/db/mongoose';
import Role from '@/lib/models/Role';
import Skill from '@/lib/models/Skill';
import RolesPageClient from './RolesPageClient';

export const metadata = {
  title: 'Manage Roles | Admin',
  description: 'Manage roles and benchmarks',
};

export default async function RolesPage() {
  await connectDB();

  // Fetch all roles with benchmarks
  const roles = await Role.find({})
    .populate('benchmarks.skillId', 'name domain')
    .sort({ name: 1 })
    .lean();

  // Fetch all active skills for benchmark assignment
  const skills = await Skill.find({ isActive: true })
    .sort({ name: 1 })
    .lean();

  // Transform to serializable format (using 'name' as 'title' for UI consistency)
  const serializedRoles = roles.map((role) => ({
    _id: role._id.toString(),
    title: role.name, // Role model uses 'name' field
    normalizedTitle: role.name.toLowerCase().replace(/\s+/g, '-'),
    description: role.description || '',
    category: role.colorClass || 'other', // Using colorClass as category indicator
    isActive: role.isActive !== false,
    benchmarks: (role.benchmarks || []).map((b: any) => ({
      _id: b._id?.toString() || `benchmark-${Date.now()}`,
      skillId: {
        _id: b.skillId?._id?.toString() || b.skillId?.toString() || '',
        name: b.skillId?.name || 'Unknown Skill',
        domain: b.skillId?.domain || 'other',
      },
      importance: b.importance || 'optional',
      weight: b.weight || 1,
      requiredLevel: b.requiredLevel || 3,
    })),
    createdAt: role.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: role.updatedAt?.toISOString() || new Date().toISOString(),
  }));

  const serializedSkills = skills.map((skill) => ({
    _id: skill._id.toString(),
    name: skill.name,
    domain: skill.domain || 'other',
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Manage Roles
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create, edit, and manage roles and their skill benchmarks.
          </p>
        </div>
      </div>

      <RolesPageClient initialRoles={serializedRoles} allSkills={serializedSkills} />
    </div>
  );
}
