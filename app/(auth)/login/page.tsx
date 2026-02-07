/**
 * Login Page
 * 
 * User authentication with email, password, and role selection.
 */

import { Metadata } from 'next';
import LoginForm from './LoginForm';

export const metadata: Metadata = {
  title: 'Login - RoleReady',
  description: 'Sign in to your RoleReady account',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#5693C1] to-[#4a80b0] flex items-center justify-center">
              <svg 
                className="w-8 h-8 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600">
            Sign in to continue to RoleReady
          </p>
        </div>
        
        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
          <LoginForm />
          
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-gray-600">
              Don&apos;t have an account?{' '}
              <a
                href="/signup"
                className="text-[#5693C1] hover:text-[#4a80b0] font-medium"
              >
                Sign up
              </a>
            </p>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            By signing in, you agree to our{' '}
            <a href="/terms" className="text-[#5693C1] hover:text-[#4a80b0]">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-[#5693C1] hover:text-[#4a80b0]">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}