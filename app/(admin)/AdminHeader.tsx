'use client';

import { useAuth } from '@/hooks';

export default function AdminHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Mobile Menu Button */}
      <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Title */}
      <div className="flex-1">
        <h1 className="text-lg font-semibold text-gray-900">
          Administration
        </h1>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Admin Badge */}
        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
          Admin
        </span>

        {/* User Info */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-gray-900">
              {user?.name || 'Admin'}
            </p>
            <p className="text-xs text-gray-500">
              {user?.email}
            </p>
          </div>
          
          <button
            onClick={() => logout()}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            title="Logout"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
