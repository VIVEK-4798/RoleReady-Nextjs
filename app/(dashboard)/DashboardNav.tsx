/**
 * Dashboard Navigation Component
 * 
 * Sidebar navigation for the dashboard with mobile support.
 * Matches the old RoleReady React project layout.
 */

'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks';

// Navigation items matching old sidebar structure
const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { href: '/dashboard/profile', label: 'Profile', icon: 'user' },
  { href: '/dashboard/skills', label: 'My Skills', icon: 'skills' },
  { href: '/dashboard/reports', label: 'Reports', icon: 'report' },
  { href: '/dashboard/notifications', label: 'Notifications', icon: 'notifications' },
];

const iconMap: Record<string, ReactNode> = {
  dashboard: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  user: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  skills: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  notifications: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  report: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  logout: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
};

export default function DashboardNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Listen for mobile menu toggle from header
  useEffect(() => {
    const handleMobileMenuToggle = (event: CustomEvent) => {
      setIsMobileMenuOpen(event.detail);
    };

    window.addEventListener('toggleMobileMenu' as any, handleMobileMenuToggle);
    return () => {
      window.removeEventListener('toggleMobileMenu' as any, handleMobileMenuToggle);
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isMobileMenuOpen]);

  const NavContent = () => (
    <>
      {/* Logo Section */}
      <div className="flex items-center h-16 px-6 border-b border-gray-200">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-[#5693C1] to-[#4a80b0] flex items-center justify-center text-white font-bold">
            R
          </div>
          <div>
            <span className="text-xl font-bold text-gray-900 block">
              RoleReady
            </span>
            <span className="text-xs text-gray-500 block">Career Platform</span>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-[#5693C1] border-l-4 border-[#5693C1] -ml-1 pl-5 shadow-sm'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:border-l-4 hover:border-gray-200 hover:-ml-1 hover:pl-5'
              }`}
            >
              <span className={isActive ? 'text-[#5693C1]' : 'text-gray-500 group-hover:text-gray-700'}>
                {iconMap[item.icon]}
              </span>
              <span>{item.label}</span>
              {isActive && (
                <span className="ml-auto w-2 h-2 bg-[#5693C1] rounded-full"></span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Section & Logout */}
      <div className="p-4 border-t border-gray-200">
        {/* User Info */}
        <div className="flex items-center gap-3 mb-4 px-2 py-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#5693C1] to-[#4a80b0] flex items-center justify-center text-white font-medium overflow-hidden ring-2 ring-white">
            {user?.image ? (
              <Image 
                src={user.image} 
                alt={user.name || 'User'} 
                width={48} 
                height={48}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-lg">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.email || 'user@example.com'}
            </p>
            <p className="text-xs text-[#5693C1] font-medium mt-1">
              {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}
            </p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-4 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors group"
        >
          <span className="text-gray-500 group-hover:text-red-600">
            {iconMap.logout}
          </span>
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 shadow-xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Close button */}
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <NavContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 shadow-sm z-30">
        <NavContent />
      </aside>
    </>
  );
}