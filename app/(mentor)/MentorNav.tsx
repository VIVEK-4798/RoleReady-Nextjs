/**
 * Mentor Navigation Component
 * 
 * Sidebar navigation for mentor panel.
 * Updated with modern design and proper TypeScript.
 */

'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

// Icons
const iconMap: Record<string, ReactNode | ((isOpen: boolean) => ReactNode)> = {
  dashboard: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  validation: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  internships: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  jobs: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  notifications: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  profile: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  logout: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
  chevronDown: (isOpen: boolean) => (
    <svg
      className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  ),
  support: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
};

// Helper function to render icon
const renderIcon = (iconKey: string, isOpen = false): ReactNode => {
  const icon = iconMap[iconKey];
  if (typeof icon === 'function') {
    return icon(isOpen);
  }
  return icon;
};

// Navigation items
const navItems = [
  {
    href: '/mentor',
    label: 'Dashboard',
    icon: 'dashboard',
    exact: true,
  },
  {
    href: '/mentor/validations',
    label: 'Skill Validation',
    icon: 'validation',
  },
  {
    href: '/mentor/internships',
    label: 'Internships',
    icon: 'internships',
    submenu: [
      { href: '/mentor/internships', label: 'All Internships' },
      { href: '/mentor/internships/add', label: 'Add Internship' },
    ],
  },
  {
    href: '/mentor/jobs',
    label: 'Jobs',
    icon: 'jobs',
    submenu: [
      { href: '/mentor/jobs', label: 'All Jobs' },
      { href: '/mentor/jobs/add', label: 'Add Job' },
    ],
  },
  {
    href: '/mentor/notifications',
    label: 'Notifications',
    icon: 'notifications',
  },
  {
    href: '/mentor/tickets',
    label: 'Support',
    icon: 'support',
  },
  {
    href: '/mentor/profile',
    label: 'Profile',
    icon: 'profile',
  },
];

interface SubMenuItem {
  href: string;
  label: string;
}

interface NavItem {
  href: string;
  label: string;
  icon: string;
  exact?: boolean;
  submenu?: SubMenuItem[];
}

export default function MentorNav() {
  const pathname = usePathname();
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Initialize submenu states based on current path
  useEffect(() => {
    const newOpenSubmenus: Record<string, boolean> = {};
    navItems.forEach((item) => {
      if (item.submenu) {
        const isActive = item.submenu.some((subitem) =>
          pathname === subitem.href || pathname.startsWith(subitem.href + '/')
        );
        if (isActive) {
          newOpenSubmenus[item.label] = true;
        }
      }
    });
    setOpenSubmenus(newOpenSubmenus);
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

  const toggleSubmenu = (label: string) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  const isActive = (item: NavItem) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname === item.href || pathname.startsWith(item.href + '/');
  };

  const isSubmenuActive = (submenu: SubMenuItem[]) => {
    return submenu.some((subitem) =>
      pathname === subitem.href || pathname.startsWith(subitem.href + '/')
    );
  };

  const { data: session } = useSession();
  const user = session?.user;
  const userName = user?.name || 'Mentor';
  const userEmail = user?.email || 'mentor@roleready.com';
  const userInitial = userName.charAt(0).toUpperCase();

  const NavContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo Section */}
      <div className="flex items-center h-16 px-6 border-b border-gray-200">
        <Link href="/" className="flex items-center">
          <img src="/img/logo/logo.png" alt="RoleReady Logo" className="w-32 h-10 lg:w-40 lg:h-12 object-contain" />
        </Link>

        {/* Close button for mobile */}
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="lg:hidden ml-auto text-gray-500 hover:text-gray-700 p-1"
          aria-label="Close menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item);
          const submenuActive = item.submenu ? isSubmenuActive(item.submenu) : false;

          if (item.submenu) {
            return (
              <div key={item.label} className="space-y-1">
                <button
                  onClick={() => toggleSubmenu(item.label)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${submenuActive || openSubmenus[item.label]
                    ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-[#5693C1] border-l-4 border-[#5693C1] -ml-1 pl-5 shadow-sm'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:border-l-4 hover:border-gray-200 hover:-ml-1 hover:pl-5'
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <span className={submenuActive || openSubmenus[item.label] ? 'text-[#5693C1]' : 'text-gray-500'}>
                      {renderIcon(item.icon)}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  <span className="ml-2">
                    {renderIcon('chevronDown', openSubmenus[item.label] || false)}
                  </span>
                </button>

                {/* Submenu */}
                <div
                  className={`overflow-hidden transition-all duration-200 ${openSubmenus[item.label] ? 'max-h-48' : 'max-h-0'
                    }`}
                >
                  <div className="space-y-1 ml-12 mt-1 py-1">
                    {item.submenu.map((subitem) => {
                      const isSubActive = pathname === subitem.href || pathname.startsWith(subitem.href + '/');
                      return (
                        <Link
                          key={subitem.label}
                          href={subitem.href}
                          className={`block py-2 px-3 rounded-lg text-sm transition-colors ${isSubActive
                            ? 'text-[#5693C1] font-medium bg-[#5693C1]/10'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {subitem.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${active
                ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-[#5693C1] border-l-4 border-[#5693C1] -ml-1 pl-5 shadow-sm'
                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:border-l-4 hover:border-gray-200 hover:-ml-1 hover:pl-5'
                }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className={active ? 'text-[#5693C1]' : 'text-gray-500 group-hover:text-gray-700'}>
                {renderIcon(item.icon)}
              </span>
              <span>{item.label}</span>
              {active && (
                <span className="ml-auto w-2 h-2 bg-[#5693C1] rounded-full"></span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Section & Logout */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 mb-4 px-2 py-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#5693C1] to-[#4a80b0] flex items-center justify-center text-white font-semibold overflow-hidden ring-2 ring-white">
            {user?.image ? (
              <img src={user.image} alt={userName} className="w-full h-full object-cover" />
            ) : (
              userInitial
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
            <p className="text-xs text-gray-500 truncate">{userEmail}</p>
            <p className="text-xs text-[#5693C1] font-medium mt-1">{(user as any)?.role?.charAt(0).toUpperCase() + (user as any)?.role?.slice(1) || 'Mentor'}</p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors group"
        >
          <span className="text-gray-500 group-hover:text-red-600">
            {renderIcon('logout')}
          </span>
          <span>Logout</span>
        </button>
      </div>
    </div>
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
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 shadow-xl transform transition-transform duration-300 ease-in-out flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <NavContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 shadow-sm z-30">
        <NavContent />
      </aside>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-30 p-2 rounded-lg bg-white border border-gray-200 shadow-sm text-gray-900"
        aria-label="Open menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </>
  );
}