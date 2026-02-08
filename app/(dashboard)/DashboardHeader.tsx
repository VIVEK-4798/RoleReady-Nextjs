/**
 * Dashboard Header Component
 * 
 * Top header bar for the dashboard.
 * Matches the old RoleReady React project layout.
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks';
import { NotificationBell } from '@/components/notifications';

export default function DashboardHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  // Debug: Log current user image
  console.log('[HEADER] Current user image:', user?.image);
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY >= 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    // Dispatch custom event for nav component to listen to
    const event = new CustomEvent('toggleMobileMenu', { detail: !isMobileMenuOpen });
    window.dispatchEvent(event);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className={`h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 transition-all ${isScrolled ? 'shadow-sm' : ''}`}>
      {/* Left Side - Mobile menu toggle and logo */}
      <div className="flex items-center gap-4">
        {/* Mobile menu toggle button */}
        <button 
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Logo - hidden on large screens (shown in sidebar) */}
        <Link href="/" className="lg:hidden flex items-center">
          <div className="h-8 w-auto flex items-center">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#5693C1] to-[#4a80b0] flex items-center justify-center text-white font-bold mr-2">
              R
            </div>
            <span className="text-lg font-bold text-gray-900">RoleReady</span>
          </div>
        </Link>
      </div>

      {/* Center - Page title (optional, can be added based on route) */}
      <div className="hidden md:flex items-center">
        <h1 className="text-lg font-medium text-gray-900">
          Dashboard
        </h1>
      </div>

      {/* Right Side - Actions */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="hidden sm:block">
          <NotificationBell />
        </div>

        {/* User Avatar Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity group"
            aria-label="User menu"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-gray-500">
                {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#5693C1] to-[#4a80b0] flex items-center justify-center text-white font-medium overflow-hidden ring-2 ring-white ring-offset-2 group-hover:ring-[#5693C1] transition-all relative">
              {user?.image ? (
                <Image 
                  key={user.image}
                  src={user.image} 
                  alt={user.name || 'User'} 
                  width={40} 
                  height={40}
                  className="absolute inset-0 w-full h-full object-cover rounded-full"
                  unoptimized
                />
              ) : (
                <span className="text-base">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              )}
            </div>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-gray-200">
                <p className="text-sm font-medium text-gray-900">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {user?.email || ''}
                </p>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                <Link
                  href="/dashboard/profile"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Profile</span>
                </Link>

                <Link
                  href="/dashboard/skills"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  <span>Skills</span>
                </Link>

                <div className="border-t border-gray-200 my-1"></div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}