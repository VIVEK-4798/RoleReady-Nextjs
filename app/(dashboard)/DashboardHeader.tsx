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

  // Toggle body class for mobile sidebar
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isMobileMenuOpen]);

  return (
    <header className={`h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 transition-all ${isScrolled ? 'shadow-sm' : ''}`}>
      {/* Left Side - Logo (visible on mobile/tablet, hidden on desktop since sidebar has it) */}
      <div className="flex items-center gap-4">
        {/* Mobile menu toggle button */}
        <button 
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Logo - hidden on large screens (shown in sidebar) */}
        <Link href="/" className="lg:hidden flex items-center">
          <div className="h-8 w-auto flex items-center">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold mr-2">
              R
            </div>
            <span className="text-lg font-bold text-gray-900">RoleReady</span>
          </div>
        </Link>
      </div>

      {/* Right Side - Actions */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <NotificationBell />

        {/* User Avatar (visible on all screens) */}
        <Link 
          href="/dashboard/profile"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium overflow-hidden">
            {user?.image ? (
              <Image 
                src={user.image} 
                alt={user.name || 'User'} 
                width={36} 
                height={36}
                className="w-full h-full object-cover"
              />
            ) : (
              user?.name?.charAt(0).toUpperCase() || 'U'
            )}
          </div>
        </Link>
      </div>
    </header>
  );
}
