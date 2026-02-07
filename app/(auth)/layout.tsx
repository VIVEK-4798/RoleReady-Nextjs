/**
 * Auth Layout
 * 
 * Shared layout for authentication pages (login, signup, forgot-password)
 * Clean, centered layout with white background and theme color accents.
 */

import { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header/Navigation */}
      <header className="w-full border-b border-gray-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-[#5693C1] to-[#4a80b0] flex items-center justify-center">
                <svg 
                  className="w-6 h-6 text-white" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">RoleReady</h1>
                <p className="text-xs text-gray-500">Career Readiness Platform</p>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center gap-6">
              <a 
                href="/" 
                className="text-gray-600 hover:text-[#5693C1] font-medium transition-colors"
              >
                Home
              </a>
              <a 
                href="/about" 
                className="text-gray-600 hover:text-[#5693C1] font-medium transition-colors"
              >
                About
              </a>
              <a 
                href="/features" 
                className="text-gray-600 hover:text-[#5693C1] font-medium transition-colors"
              >
                Features
              </a>
              <a 
                href="/contact" 
                className="text-gray-600 hover:text-[#5693C1] font-medium transition-colors"
              >
                Contact
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {/* Decorative Elements */}
          <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2">
            <div className="w-64 h-64 bg-blue-50 rounded-full opacity-50 blur-3xl"></div>
          </div>
          <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2">
            <div className="w-64 h-64 bg-blue-50 rounded-full opacity-30 blur-3xl"></div>
          </div>
          
          {/* Content Container */}
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <p className="text-gray-600 text-sm">
                © {new Date().getFullYear()} RoleReady. All rights reserved.
              </p>
            </div>
            
            <div className="flex items-center gap-6">
              <a 
                href="/terms" 
                className="text-gray-500 hover:text-[#5693C1] text-sm transition-colors"
              >
                Terms
              </a>
              <a 
                href="/privacy" 
                className="text-gray-500 hover:text-[#5693C1] text-sm transition-colors"
              >
                Privacy
              </a>
              <a 
                href="/cookies" 
                className="text-gray-500 hover:text-[#5693C1] text-sm transition-colors"
              >
                Cookies
              </a>
              <a 
                href="/help" 
                className="text-gray-500 hover:text-[#5693C1] text-sm transition-colors"
              >
                Help
              </a>
            </div>
            
            <div className="flex items-center gap-4">
              <a 
                href="#" 
                className="text-gray-400 hover:text-[#5693C1] transition-colors"
                aria-label="Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                </svg>
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-[#5693C1] transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path>
                </svg>
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-[#5693C1] transition-colors"
                aria-label="GitHub"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}