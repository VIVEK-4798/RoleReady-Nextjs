/**
 * Mentor Navigation Component
 * 
 * Sidebar navigation for mentor panel.
 * Migrated from old React project mentor dashboard Sidebar.jsx.
 */

'use client';

import { useState, useEffect, ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

// Sidebar menu structure matching old project
interface SubLink {
  title: string;
  href: string;
}

interface SidebarItem {
  icon: ReactNode;
  title: string;
  href?: string;
  links?: SubLink[];
}

// Icons as React components
const ProfileIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const ValidationIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const BriefcaseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const NotificationIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
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

const DashboardIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

// Sidebar menu data - matching old project structure
const sidebarData: SidebarItem[] = [
  {
    icon: <ValidationIcon />,
    title: 'Skill Validation',
    href: '/mentor/validation-queue',
  },
  {
    icon: <BriefcaseIcon />,
    title: 'Internships',
    links: [
      { title: 'All Internships', href: '/mentor/internships' },
      { title: 'Add Internship', href: '/mentor/internships/add' },
    ],
  },
  {
    icon: <BriefcaseIcon />,
    title: 'Jobs',
    links: [
      { title: 'All Jobs', href: '/mentor/jobs' },
      { title: 'Add Job', href: '/mentor/jobs/add' },
    ],
  },
  {
    icon: <NotificationIcon />,
    title: 'Notifications',
    href: '/mentor/notifications',
  },
  {
    icon: <ProfileIcon />,
    title: 'Profile',
    href: '/mentor/profile',
  },
];

export default function MentorNav() {
  const pathname = usePathname();
  const [openDropdowns, setOpenDropdowns] = useState<Record<number, boolean>>({});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Auto-expand dropdowns based on current path
  useEffect(() => {
    sidebarData.forEach((item, index) => {
      if (item.links?.some((link) => pathname.startsWith(link.href))) {
        setOpenDropdowns((prev) => ({ ...prev, [index]: true }));
      }
    });
  }, [pathname]);

  const toggleDropdown = (index: number) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const isActiveLink = (href: string) => {
    if (href === '/mentor') {
      return pathname === '/mentor';
    }
    return pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center h-16 px-6 border-b border-gray-200">
        <Link href="/mentor" className="flex items-center gap-2">
          <Image 
            src="/img/logo/logo.png" 
            alt="RoleReady" 
            width={120} 
            height={32}
            className="h-8 w-auto"
          />
        </Link>
      </div>

      {/* Dashboard Link - Static */}
      <div className="px-4 py-4">
        <Link
          href="/mentor"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            pathname === '/mentor'
              ? 'bg-[#5693C1] text-white'
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <DashboardIcon />
          <span className="font-medium">Dashboard</span>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
        {sidebarData.map((item, index) => {
          if (item.links) {
            // Dropdown menu item
            const hasActiveChild = item.links.some((link) => pathname.startsWith(link.href));
            const isOpen = openDropdowns[index];

            return (
              <div key={index} className="space-y-1">
                <button
                  onClick={() => toggleDropdown(index)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                    hasActiveChild
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span className="font-medium">{item.title}</span>
                  </div>
                  <ChevronDownIcon isOpen={isOpen || false} />
                </button>

                {/* Dropdown content */}
                <div
                  className={`overflow-hidden transition-all duration-200 ${
                    isOpen ? 'max-h-48' : 'max-h-0'
                  }`}
                >
                  <ul className="pl-12 py-2 space-y-1">
                    {item.links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <Link
                          href={link.href}
                          className={`block py-2 px-3 rounded-lg text-sm transition-colors ${
                            isActiveLink(link.href)
                              ? 'text-[#5693C1] bg-[#5693C1]/10'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                          }`}
                        >
                          {link.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          } else {
            // Single link item
            return (
              <Link
                key={index}
                href={item.href || '#'}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActiveLink(item.href || '')
                    ? 'bg-[#5693C1] text-white'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.title}</span>
              </Link>
            );
          }
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 space-y-1">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogoutIcon />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-40">
        <SidebarContent />
      </aside>

      {/* Mobile Menu Button - visible in header */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white border border-gray-200 text-gray-900"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isMobileMenuOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
