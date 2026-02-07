/**
 * Dashboard Header Component
 * 
 * Top header bar for the dashboard.
 * Matches the old RoleReady React project layout.
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks';
import { NotificationBell } from '@/components/notifications';

export default function DashboardHeader() {
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

        {/* User Avatar */}
        <Link 
          href="/dashboard/profile"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity group"
        >
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-900">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-gray-500">
              {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#5693C1] to-[#4a80b0] flex items-center justify-center text-white font-medium overflow-hidden ring-2 ring-white ring-offset-2 group-hover:ring-[#5693C1] transition-all">
            {user?.image ? (
              <Image 
                src={user.image} 
                alt={user.name || 'User'} 
                width={40} 
                height={40}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-base">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            )}
          </div>
        </Link>
      </div>
    </header>
  );
}