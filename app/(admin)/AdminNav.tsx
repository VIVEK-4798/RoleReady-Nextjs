'use client';

import { useState, useEffect, ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

interface SubLink {
  title: string;
  href: string;
  badge?: string;
}

interface SidebarItem {
  icon: ReactNode;
  title: string;
  href?: string;
  links?: SubLink[];
  badge?: string;
}

// Modern Icons
const DashboardIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
    <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
  </svg>
);

const BriefcaseIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm4 8a1 1 0 10-2 0 1 1 0 002 0z" clipRule="evenodd" />
    <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
  </svg>
);

const CompassIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
  </svg>
);

const MailIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
  </svg>
);

const ChevronDownIcon = ({ isOpen }: { isOpen: boolean }) => (
  <svg
    className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

const sidebarData: SidebarItem[] = [
  {
    icon: <BriefcaseIcon />,
    title: 'Internships',
    badge: '2',
    links: [
      { title: 'All Internships', href: '/admin/internships' },
      { title: 'Add Internship', href: '/admin/internships/add', badge: 'New' },
    ],
  },
  {
    icon: <BriefcaseIcon />,
    title: 'Jobs',
    links: [
      { title: 'All Jobs', href: '/admin/jobs' },
      { title: 'Add Job', href: '/admin/jobs/add', badge: 'New' },
    ],
  },
  {
    icon: <UsersIcon />,
    title: 'Users',
    badge: '12',
    links: [
      { title: 'All Users', href: '/admin/users' },
      { title: 'Add User', href: '/admin/users/add' },
    ],
  },
  {
    icon: <SettingsIcon />,
    title: 'Categories',
    links: [
      { title: 'Internship Categories', href: '/admin/categories/internships' },
      { title: 'Job Categories', href: '/admin/categories/jobs' },
    ],
  },
  {
    icon: <CompassIcon />,
    title: 'Readiness Config',
    links: [
      { title: 'Roles', href: '/admin/roles' },
      { title: 'Skills', href: '/admin/skills' },
      { title: 'Benchmarks', href: '/admin/benchmarks' },
    ],
  },
  {
    icon: <MailIcon />,
    title: 'Email Management',
    href: '/admin/email',
  },
  {
    icon: <SettingsIcon />,
    title: 'Profile',
    href: '/admin/profile',
  },
];

export default function AdminNav() {
  const pathname = usePathname();
  const [openDropdowns, setOpenDropdowns] = useState<Record<number, boolean>>({});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

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
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const SidebarContent = () => (
    <>
      {/* Logo Section */}
      <div className="flex items-center justify-between h-20 px-6 border-b border-gray-100">
        <Link href="/admin" className="flex items-center gap-3">
          {isCollapsed ? (
            <div className="flex items-center justify-center w-10 h-10 rounded-xl overflow-hidden">
              <Image
                src="/img/logo/logo.png"
                alt="RoleReady Logo"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
          ) : (
            <div>
              <Image
                src="/img/logo/logo.png"
                alt="RoleReady"
                width={120}
                height={32}
                className="object-contain"
              />
              <p className="text-xs text-gray-500 mt-1">Admin Panel</p>
            </div>
          )}
        </Link>

        {/* Collapse Toggle - Desktop */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-500"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Dashboard Link */}
      <div className="px-4 py-3">
        <Link
          href="/admin"
          className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group ${pathname === '/admin'
              ? 'bg-gradient-to-r from-[#5693C1] to-blue-400 text-white shadow-lg shadow-blue-100'
              : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
            }`}
        >
          <DashboardIcon />
          {!isCollapsed && <span className="font-medium">Dashboard</span>}
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {sidebarData.map((item, index) => {
          if (item.links) {
            const hasActiveChild = item.links.some((link) => isActiveLink(link.href));
            const isOpen = openDropdowns[index];

            return (
              <div key={index} className="space-y-1">
                <button
                  onClick={() => toggleDropdown(index)}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-300 group ${hasActiveChild
                      ? 'bg-blue-50 text-[#5693C1]'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg group-hover:bg-white/50 ${hasActiveChild ? 'bg-white/80' : 'bg-gray-100'
                      }`}>
                      {item.icon}
                    </div>
                    {!isCollapsed && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.title}</span>
                        {item.badge && (
                          <span className="px-1.5 py-0.5 text-xs font-medium bg-red-100 text-red-600 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  {!isCollapsed && (
                    <div className="flex items-center gap-2">
                      <ChevronDownIcon isOpen={isOpen || false} />
                    </div>
                  )}
                </button>

                {/* Dropdown content */}
                <div
                  className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-64' : 'max-h-0'
                    }`}
                >
                  <ul className={`${isCollapsed ? 'pl-0' : 'pl-12'} py-2 space-y-1`}>
                    {item.links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <Link
                          href={link.href}
                          className={`flex items-center justify-between py-2 px-4 rounded-lg text-sm transition-all duration-200 group ${isActiveLink(link.href)
                              ? 'bg-gradient-to-r from-[#5693C1]/10 to-blue-400/10 text-[#5693C1]'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                        >
                          <span className="truncate">{link.title}</span>
                          {link.badge && (
                            <span className="px-1.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-600 rounded-full">
                              {link.badge}
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          } else {
            return (
              <Link
                key={index}
                href={item.href || '#'}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group ${isActiveLink(item.href || '')
                    ? 'bg-gradient-to-r from-[#5693C1] to-blue-400 text-white shadow-lg shadow-blue-100'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
                  }`}
              >
                <div className={`p-1.5 rounded-lg group-hover:bg-white/50 ${isActiveLink(item.href || '') ? 'bg-white/30' : 'bg-gray-100'
                  }`}>
                  {item.icon}
                </div>
                {!isCollapsed && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.title}</span>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-xs font-medium bg-red-100 text-red-600 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            );
          }
        })}
      </nav>

      {/* Footer Section */}
      <div className="p-4 border-t border-gray-100 space-y-2">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-300 group"
        >
          <div className="p-1.5 rounded-lg bg-gray-100 group-hover:bg-red-100">
            <LogoutIcon />
          </div>
          {!isCollapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex lg:flex-col fixed inset-y-0 left-0 bg-white border-r border-gray-100 z-40 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'
        }`}>
        <SidebarContent />
      </aside>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 w-72 bg-white border-r border-gray-100 z-50 transform transition-transform duration-300 shadow-2xl ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 rounded-xl bg-white border border-gray-200 shadow-lg text-gray-900 hover:shadow-xl transition-shadow"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          {isMobileMenuOpen ? (
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          ) : (
            <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          )}
        </svg>
      </button>
    </>
  );
}