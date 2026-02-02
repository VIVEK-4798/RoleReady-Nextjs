'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

interface LandingHeaderProps {
  isAuthenticated: boolean;
}

export default function LandingHeader({ isAuthenticated }: LandingHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-sm' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/img/logo/logo.png"
              alt="RoleReady"
              width={150}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link 
              href="/#how-it-works" 
              className="text-slate-600 hover:text-[#5693C1] transition-colors font-medium"
            >
              How It Works
            </Link>
            <Link 
              href="/#features" 
              className="text-slate-600 hover:text-[#5693C1] transition-colors font-medium"
            >
              Features
            </Link>
            <Link 
              href="/#for-who" 
              className="text-slate-600 hover:text-[#5693C1] transition-colors font-medium"
            >
              For Who
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-slate-600 hover:text-[#5693C1] transition-colors font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/profile"
                  className="px-5 py-2.5 bg-[#5693C1] hover:bg-[#4a80b0] text-white font-medium rounded-lg transition-all duration-200 hover:shadow-md"
                >
                  Profile
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-slate-600 hover:text-[#5693C1] transition-colors font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-5 py-2.5 bg-[#5693C1] hover:bg-[#4a80b0] text-white font-medium rounded-lg transition-all duration-200 hover:shadow-md"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg 
              className="w-6 h-6 text-slate-700" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col gap-4">
              <Link 
                href="/#how-it-works" 
                className="text-slate-600 hover:text-[#5693C1] transition-colors font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                How It Works
              </Link>
              <Link 
                href="/#features" 
                className="text-slate-600 hover:text-[#5693C1] transition-colors font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link 
                href="/#for-who" 
                className="text-slate-600 hover:text-[#5693C1] transition-colors font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                For Who
              </Link>
              
              <div className="flex flex-col gap-3 pt-4 border-t border-gray-200">
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="text-center py-2.5 text-[#5693C1] font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/dashboard/profile"
                      className="text-center py-2.5 bg-[#5693C1] text-white font-medium rounded-lg"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Profile
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="text-center py-2.5 text-[#5693C1] font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      className="text-center py-2.5 bg-[#5693C1] text-white font-medium rounded-lg"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign Up
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
