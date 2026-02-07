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

  // Transform to serializable format
  const serializedRoles = roles.map((role) => ({
    _id: role._id.toString(),
    title: role.name,
    normalizedTitle: role.name.toLowerCase().replace(/\s+/g, '-'),
    description: role.description || '',
    category: role.colorClass || 'other',
    isActive: role.isActive !== false,
    benchmarks: (role.benchmarks || []).map((b: any, index: number) => ({
      // Use a combination of role ID, skill ID, and index for uniqueness
      _id: b._id?.toString() || `benchmark-${role._id.toString()}-${b.skillId?._id?.toString() || 'unknown'}-${index}`,
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
          <h1 className="text-2xl font-bold text-gray-900">
            Manage Roles
          </h1>
          <p className="text-gray-600 mt-1">
            Create, edit, and manage roles and their skill benchmarks.
          </p>
        </div>
      </div>

      <RolesPageClient initialRoles={serializedRoles} allSkills={serializedSkills} />
    </div>
  );
}