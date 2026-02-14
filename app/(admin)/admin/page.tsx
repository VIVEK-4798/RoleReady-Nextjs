import connectDB from '@/lib/db/mongoose';
import { Skill, Role, User, UserSkill, TargetRole } from '@/lib/models';
import { AdminStatsCards, AdminQuickActions, AdminRecentActivity } from '@/components/admin';

// Modern Icons
const SkillsIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9 12H5.414l-1.707 1.707a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 12H9z" />
    <path d="M17 8h-2.586l1.707-1.707a1 1 0 00-1.414-1.414l-4 4a1 1 0 001.414 1.414L14 8h2a1 1 0 100-2z" />
  </svg>
);

const RolesIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm4 8a1 1 0 10-2 0 1 1 0 002 0z" clipRule="evenodd" />
    <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
  </svg>
);

const ValidationIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

const MentorsIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
  </svg>
);

const TargetRolesIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
  </svg>
);

async function getStats() {
  await connectDB();

  // Import service dynamically or at top level if possible, but here inside function to keep it cleaner for this file
  const { getPendingValidationsForAdmin } = await import('@/lib/services/mentorQueueService');
  const adminPendingValidations = await getPendingValidationsForAdmin();

  const [
    totalSkills,
    activeSkills,
    totalRoles,
    activeRoles,
    totalUsers,
    totalMentors,
    targetRolesCount,
    recentUsers,
  ] = await Promise.all([
    Skill.countDocuments(),
    Skill.countDocuments({ isActive: true }),
    Role.countDocuments(),
    Role.countDocuments({ isActive: true }),
    User.countDocuments({ role: 'user', isActive: true }),
    User.countDocuments({ role: 'mentor', isActive: true }),
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
    pendingValidations: adminPendingValidations.length,
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

  const statsCards = [
    {
      title: 'Total Skills',
      value: stats.skills.total.toString(),
      subtitle: `${stats.skills.active} active`,
      href: '/admin/skills',
      icon: <SkillsIcon />,
      trend: '+12%',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Active Roles',
      value: stats.roles.active.toString(),
      subtitle: `${stats.roles.total} total`,
      href: '/admin/roles',
      icon: <RolesIcon />,
      trend: '+8%',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Users',
      value: stats.users.total.toString(),
      subtitle: 'Active members',
      href: '/admin/users',
      icon: <UsersIcon />,
      trend: '+24%',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Mentors',
      value: stats.mentors.total.toString(),
      subtitle: 'Active guides',
      href: '/admin/users?filter=mentor',
      icon: <MentorsIcon />,
      trend: '+15%',
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      title: 'Pending Validations',
      value: stats.pendingValidations.toString(),
      subtitle: 'Awaiting review',
      href: '/admin/users?filter=pending',
      icon: <ValidationIcon />,
      trend: '5 new',
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      title: 'Target Roles',
      value: stats.targetRolesCount.toString(),
      subtitle: 'User selections',
      href: '/admin/roles',
      icon: <TargetRolesIcon />,
      trend: '+32%',
      color: 'from-cyan-500 to-cyan-600',
      bgColor: 'bg-cyan-50',
    },
  ];

  const quickActions = [
    {
      title: 'Add New Skill',
      description: 'Create a new skill definition',
      href: '/admin/skills?action=create',
      icon: <PlusIcon />,
      color: 'text-blue-600 bg-blue-50 hover:bg-blue-100 border-blue-200',
    },
    {
      title: 'Create Role',
      description: 'Define a new job role',
      href: '/admin/roles?action=create',
      icon: <PlusIcon />,
      color: 'text-purple-600 bg-purple-50 hover:bg-purple-100 border-purple-200',
    },
    {
      title: 'Edit Benchmarks',
      description: 'Configure role requirements',
      href: '/admin/benchmarks',
      icon: <SettingsIcon />,
      color: 'text-green-600 bg-green-50 hover:bg-green-100 border-green-200',
    },
    {
      title: 'Manage Users',
      description: 'View and edit users',
      href: '/admin/users',
      icon: <UsersIcon />,
      color: 'text-orange-600 bg-orange-50 hover:bg-orange-100 border-orange-200',
    },
    {
      title: 'Review Validations',
      description: 'Approve pending skills',
      href: '/admin/users?filter=pending',
      icon: <ValidationIcon />,
      color: 'text-amber-600 bg-amber-50 hover:bg-amber-100 border-amber-200',
    },
    {
      title: 'System Settings',
      description: 'Configure platform',
      href: '/admin/settings',
      icon: <SettingsIcon />,
      color: 'text-gray-600 bg-gray-50 hover:bg-gray-100 border-gray-200',
    },
  ];

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-[#5693C1]/10 to-blue-400/10 rounded-2xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Welcome back, Admin!
            </h1>
            <p className="mt-2 text-gray-600">
              Here's what's happening with your platform today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 text-sm font-medium bg-white text-[#5693C1] rounded-full border border-[#5693C1]/20">
              Last updated: Today
            </span>
            <button className="px-4 py-2 text-sm font-medium bg-[#5693C1] text-white rounded-xl hover:bg-[#5693C1]/90 transition-colors">
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {statsCards.map((card, index) => (
          <div key={index} className="bg-white rounded-2xl border border-gray-200 p-5 md:p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-xl ${card.bgColor}`}>
                <div className={`text-white p-2 rounded-lg bg-gradient-to-br ${card.color}`}>
                  {card.icon}
                </div>
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                {card.trend}
              </span>
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500">{card.title}</h3>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl md:text-3xl font-bold text-gray-900">{card.value}</span>
                <span className="text-sm text-gray-500">{card.subtitle}</span>
              </div>
            </div>

            <a
              href={card.href}
              className="mt-4 inline-flex items-center text-sm font-medium text-[#5693C1] hover:text-[#5693C1]/80"
            >
              View details
              <svg className="ml-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 md:p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg md:text-xl font-bold text-gray-900">Recent Users</h2>
                <p className="text-sm text-gray-500 mt-1">Latest user registrations</p>
              </div>
              <a
                href="/admin/users"
                className="text-sm font-medium text-[#5693C1] hover:text-[#5693C1]/80 flex items-center gap-1"
              >
                View all
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </a>
            </div>

            <div className="space-y-4">
              {stats.recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#5693C1] to-blue-400 flex items-center justify-center text-white font-semibold">
                      {user.title.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{user.title}</h4>
                      <p className="text-xs text-gray-500">{user.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-medium text-gray-900">{user.time}</span>
                    <span className="block text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full mt-1">
                      Active
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 md:p-6">
            <div className="mb-6">
              <h2 className="text-lg md:text-xl font-bold text-gray-900">Quick Actions</h2>
              <p className="text-sm text-gray-500 mt-1">Frequently used tasks</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {quickActions.map((action, index) => (
                <a
                  key={index}
                  href={action.href}
                  className={`flex items-center gap-3 p-4 rounded-xl border transition-all hover:shadow-md ${action.color}`}
                >
                  <div className="p-2 rounded-lg bg-white">
                    {action.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium truncate">{action.title}</h4>
                    <p className="text-xs text-gray-500 truncate">{action.description}</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}