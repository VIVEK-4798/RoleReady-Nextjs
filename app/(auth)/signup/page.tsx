/**
 * Signup Page
 * 
 * User registration page.
 */

import { Metadata } from 'next';
import SignupForm from './SignupForm';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sign Up - RoleReady',
  description: 'Create your RoleReady account',
};

export default function SignupPage() {
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
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" 
                />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create Account
          </h1>
          <p className="text-gray-600">
            Start your journey to job readiness
          </p>
        </div>
        
        {/* Signup Form */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
          <SignupForm />
          
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-[#5693C1] hover:text-[#4a80b0] font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-[#5693C1] text-sm font-medium mb-1">Skill Assessment</div>
            <div className="text-xs text-gray-600">Evaluate your capabilities</div>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-[#5693C1] text-sm font-medium mb-1">Career Guidance</div>
            <div className="text-xs text-gray-600">Get personalized advice</div>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-[#5693C1] text-sm font-medium mb-1">Job Matching</div>
            <div className="text-xs text-gray-600">Find suitable opportunities</div>
          </div>
        </div>
      </div>
    </div>
  );
}