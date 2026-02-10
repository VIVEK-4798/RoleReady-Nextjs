'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks';
import { 
  Home, 
  Users, 
  Target, 
  Compass, 
  BarChart3, 
  Menu, 
  X,
  ChevronRight,
  Zap,
  Settings,
  LogIn,
  UserPlus,
  User as UserIcon,
  Mail
} from 'lucide-react';

interface LandingHeaderProps {
  isAuthenticated: boolean;
}

interface NavLink {
  href: string;
  label: string;
  icon: React.ReactNode;
  authenticatedOnly?: boolean;
  isSection?: boolean;
}

export default function LandingHeader({ isAuthenticated }: LandingHeaderProps) {
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const mainNavLinks: NavLink[] = [
    { href: '/#how-it-works', label: 'How It Works', icon: <Zap className="w-4 h-4" />, isSection: true },
    // { href: '/#features', label: 'Features', icon: <Settings className="w-4 h-4" />, isSection: true },
    // { href: '/#for-who', label: 'For Who', icon: <Users className="w-4 h-4" />, isSection: true },
  ];

  const authenticatedNavLinks: NavLink[] = [
    { href: '/readiness', label: 'Readiness', icon: <Target className="w-4 h-4" />, authenticatedOnly: true },
    { href: '/roadmap', label: 'Roadmap', icon: <Compass className="w-4 h-4" />, authenticatedOnly: true },
    { href: '/report', label: 'Report', icon: <BarChart3 className="w-4 h-4" />, authenticatedOnly: true },
  ];

  const allNavLinks = [...mainNavLinks, ...authenticatedNavLinks];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
         <div className="flex items-center">
        <Link href="/" className="flex items-center">
          <img src="/img/logo/logo.png" alt="RoleReady Logo" className="w-32 h-10 lg:w-40 lg:h-12 object-contain" />
        </Link>
      </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {mainNavLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href} 
                className="flex items-center gap-2 text-gray-700 hover:text-[#5693C1] transition-colors font-semibold text-sm group"
              >
                <span className="text-[#5693C1] opacity-80 group-hover:opacity-100 transition-opacity">
                  {link.icon}
                </span>
                {link.label}
              </Link>
            ))}
            
            {isAuthenticated && (
              <>
                {authenticatedNavLinks.map((link) => (
                  <Link 
                    key={link.href}
                    href={link.href} 
                    className="flex items-center gap-2 text-gray-700 hover:text-[#5693C1] transition-colors font-semibold text-sm group"
                  >
                    <span className="text-[#5693C1] opacity-80 group-hover:opacity-100 transition-opacity">
                      {link.icon}
                    </span>
                    {link.label}
                  </Link>
                ))}
              </>
            )}
          </nav>

          {/* Auth Buttons / User Info - Desktop */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/dashboard"
                  className="px-4 py-2 bg-gradient-to-r from-[#5693C1] to-[#4a80b0] text-white font-semibold rounded-lg hover:shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/profile"
                  className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all group border border-gray-200"
                >
                  {/* User Avatar */}
                  <div className="relative w-10 h-10 rounded-full bg-gradient-to-r from-[#5693C1] to-[#4a80b0] flex items-center justify-center text-white font-semibold overflow-hidden ring-2 ring-white/20 shrink-0 group-hover:ring-[#5693C1]/30 transition-all">
                    {user.image ? (
                      <Image 
                        src={user.image} 
                        alt={user.name || 'User'} 
                        width={40} 
                        height={40}
                        className="w-full h-full object-cover rounded-full"
                        unoptimized
                      />
                    ) : (
                      <UserIcon className="w-5 h-5" />
                    )}
                  </div>
                  
                  {/* User Info */}
                  <div className="text-left min-w-0">
                    <p className="text-sm font-semibold text-gray-900 leading-tight truncate max-w-[140px]">
                      {user.name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 leading-tight mt-0.5 truncate max-w-[140px] flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {user.email || 'user@example.com'}
                    </p>
                  </div>
                </Link>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="flex items-center gap-2 text-gray-700 hover:text-[#5693C1] transition-colors font-semibold text-sm group"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-6 py-3 bg-gradient-to-r from-[#5693C1] to-[#4a80b0] text-white font-semibold rounded-lg hover:shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2.5 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 bg-white animate-in slide-in-from-top-5 duration-200">
            <nav className="flex flex-col">
              {allNavLinks
                .filter(link => !link.authenticatedOnly || isAuthenticated)
                .map((link) => (
                  <Link 
                    key={link.href}
                    href={link.href} 
                    className="flex items-center justify-between py-3 px-4 text-gray-700 hover:text-[#5693C1] hover:bg-gray-50 transition-colors font-semibold border-b border-gray-100 last:border-b-0"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[#5693C1]">
                        {link.icon}
                      </span>
                      {link.label}
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </Link>
                ))}
              
              {/* Mobile Auth Section */}
              <div className="pt-6 px-4 border-t border-gray-200">
                {isAuthenticated && user ? (
                  <>
                    {/* User Info Card - Mobile */}
                    <Link
                      href="/dashboard/profile"
                      className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors mb-4"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="relative w-12 h-12 rounded-full bg-gradient-to-r from-[#5693C1] to-[#4a80b0] flex items-center justify-center text-white font-semibold overflow-hidden ring-2 ring-white/20 shrink-0">
                        {user.image ? (
                          <Image 
                            src={user.image} 
                            alt={user.name || 'User'} 
                            width={48} 
                            height={48}
                            className="w-full h-full object-cover rounded-full"
                            unoptimized
                          />
                        ) : (
                          <UserIcon className="w-6 h-6" />
                        )}
                      </div>
                      
                      <div className="text-left flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 leading-tight truncate">
                          {user.name || 'User'}
                        </p>
                        <p className="text-xs text-gray-500 leading-tight mt-0.5 truncate flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {user.email || 'user@example.com'}
                        </p>
                      </div>
                    </Link>
                    
                    <Link
                      href="/dashboard"
                      className="block w-full text-center py-3 bg-gradient-to-r from-[#5693C1] to-[#4a80b0] text-white font-semibold rounded-lg hover:shadow-md transition-all duration-200 active:scale-[0.98] mb-3"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Go to Dashboard
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="flex items-center justify-center gap-2 py-3 text-[#5693C1] font-semibold border-2 border-[#5693C1] rounded-lg hover:bg-blue-50 transition-colors mb-3"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <LogIn className="w-4 h-4" />
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      className="block w-full text-center py-3 bg-gradient-to-r from-[#5693C1] to-[#4a80b0] text-white font-semibold rounded-lg hover:shadow-md transition-all duration-200 active:scale-[0.98]"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}