/**
 * Mentor Header Component
 * 
 * Header for mentor dashboard with user profile, dropdown menu, and notifications.
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import NotificationBell from '@/components/notifications/NotificationBell';

const NotificationIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const ChevronDownIcon = ({ isOpen }: { isOpen: boolean }) => (
  <svg
    className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const ValidationIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

interface MentorHeaderProps {
  userName?: string;
  userEmail?: string;
}

export default function MentorHeader({
  userName: propUserName,
  userEmail: propUserEmail
}: MentorHeaderProps) {
  const { data: session } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get user data from session or props
  const userName = propUserName || session?.user?.name || 'Mentor';
  const userEmail = propUserEmail || session?.user?.email || 'mentor@roleready.com';

  // Get first letter of name for avatar
  const userInitial = userName.charAt(0).toUpperCase();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Empty for now, can add breadcrumbs or title later */}
          <div className="flex-1"></div>

          {/* Right side - User profile and notifications */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <NotificationBell />

            {/* User profile dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="User menu"
              >
                {/* Avatar with initial */}
                <div className="w-8 h-8 rounded-full bg-[#5693C1] flex items-center justify-center text-white font-semibold">
                  {userInitial}
                </div>

                {/* User info - hidden on small screens */}
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">{userName}</p>
                  <p className="text-xs text-gray-500 truncate max-w-[150px]">{userEmail}</p>
                </div>

                <ChevronDownIcon isOpen={isDropdownOpen} />
              </button>

              {/* Dropdown menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  {/* User info in dropdown */}
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="font-medium text-gray-900">{userName}</p>
                    <p className="text-sm text-gray-500 truncate">{userEmail}</p>
                  </div>

                  <div className="py-2">
                    <Link
                      href="/mentor/profile"
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <UserIcon />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      href="/mentor/validation-queue"
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <ValidationIcon />
                      <span>Skill Validation</span>
                    </Link>

                    <Link
                      href="/mentor/settings"
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <SettingsIcon />
                      <span>Settings</span>
                    </Link>
                  </div>

                  <div className="border-t border-gray-200 pt-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogoutIcon />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}