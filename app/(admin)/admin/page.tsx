/**
 * Admin Dashboard Page
 * 
 * Main admin dashboard overview with stats, quick actions, and recent activity.
 * Migrated from old React project's dashboard-index.jsx
 */

import connectDB from '@/lib/db/mongoose';
import { Skill, Role, User, UserSkill, TargetRole } from '@/lib/models';
import { AdminStatsCards, AdminQuickActions, AdminRecentActivity } from '@/components/admin';

// Icons for stat cards
const SkillsIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

const RolesIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const ValidationIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const MentorsIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const TargetRolesIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

async function getStats() {
  await connectDB();

  const [
    totalSkills,
    activeSkills,
    totalRoles,
    activeRoles,
    totalUsers,
    totalMentors,
    pendingValidations,
    targetRolesCount,
    recentUsers,
  ] = await Promise.all([
    Skill.countDocuments(),
    Skill.countDocuments({ isActive: true }),
    Role.countDocuments(),
    Role.countDocuments({ isActive: true }),
    User.countDocuments({ role: 'user', isActive: true }),
    User.countDocuments({ role: 'mentor', isActive: true }),
    UserSkill.countDocuments({ validationStatus: 'pending' }),
    TargetRole.countDocuments(),
    User.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email role createdAt')
      .lean(),
  ]);

  return {
    skills: { total: totalSkills, active: activeSkills },
    roles: { total: totalRoles, active: activeRoles },
    users: { total: totalUsers },
    mentors: { total: totalMentors },
    pendingValidations,
    targetRolesCount,
    recentUsers: recentUsers.map((user) => ({
      id: user._id?.toString() || '',
      title: user.name || 'Unknown User',
      description: user.email || '',
      time: new Date(user.createdAt as Date).toLocaleDateString(),
      status: 'completed' as const,
    })),
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  // Stats cards matching old project's DashboardCard structure
  const statsCards = [
    {
      title: 'Skills',
      value: stats.skills.active,
      subtitle: `${stats.skills.total - stats.skills.active} inactive`,
      href: '/admin/skills',
      color: 'bg-blue-500',
      icon: <SkillsIcon />,
    },
    {
      title: 'Roles',
      value: stats.roles.active,
      subtitle: `${stats.roles.total - stats.roles.active} inactive`,
      href: '/admin/roles',
      color: 'bg-purple-500',
      icon: <RolesIcon />,
    },
    {
      title: 'Users',
      value: stats.users.total,
      subtitle: 'active users',
      href: '/admin/users',
      color: 'bg-green-500',
      icon: <UsersIcon />,
    },
    {
      title: 'Mentors',
      value: stats.mentors.total,
      subtitle: 'active mentors',
      href: '/admin/users?filter=mentor',
      color: 'bg-indigo-500',
      icon: <MentorsIcon />,
    },
    {
      title: 'Pending Validations',
      value: stats.pendingValidations,
      subtitle: 'skills awaiting review',
      href: '/admin/users',
      color: 'bg-amber-500',
      icon: <ValidationIcon />,
    },
    {
      title: 'Target Roles',
      value: stats.targetRolesCount,
      subtitle: 'user role selections',
      href: '/admin/roles',
      color: 'bg-cyan-500',
      icon: <TargetRolesIcon />,
    },
  ];

  // Quick actions matching old project
  const quickActions = [
    {
      title: 'Add Skill',
      description: 'Create a new skill',
      href: '/admin/skills?action=create',
      icon: <PlusIcon />,
      color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Add Role',
      description: 'Create a new job role',
      href: '/admin/roles?action=create',
      icon: <PlusIcon />,
      color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    },
    {
      title: 'Edit Benchmarks',
      description: 'Configure role requirements',
      href: '/admin/benchmarks',
      icon: <SettingsIcon />,
      color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    },
    {
      title: 'Manage Users',
      description: 'View and edit users',
      href: '/admin/users',
      icon: <EditIcon />,
      color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
    },
    {
      title: 'Review Validations',
      description: 'Approve pending skills',
      href: '/admin/users?filter=pending',
      icon: <ValidationIcon />,
      color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    },
    {
      title: 'System Settings',
      description: 'Configure platform',
      href: '/admin/settings',
      icon: <SettingsIcon />,
      color: 'bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header - matching old project layout */}
      <div className="pb-6 border-b border-gray-200">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Admin Dashboard
        </h1>
        <p className="mt-2 text-gray-600">
          Track and manage skills, roles, users, and all platform configurations.
        </p>
      </div>

      {/* Stats Cards Section */}
      <AdminStatsCards cards={statsCards} />

      {/* Two Column Layout - matching old project */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Recent Activity - Left Column */}
        <div className="lg:col-span-2">
          <AdminRecentActivity
            title="Recent Users"
            viewAllHref="/admin/users"
            activities={stats.recentUsers}
            emptyMessage="No recent user registrations"
          />
        </div>

        {/* Quick Actions - Right Column (wider) */}
        <div className="lg:col-span-3">
          <AdminQuickActions actions={quickActions} />
        </div>
      </div>
    </div>
  );
}
