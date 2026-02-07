/**
 * Forgot Password Page
 * 
 * Password reset flow with OTP verification.
 */

import { Metadata } from 'next';
import ForgotPasswordForm from './ForgotPasswordForm';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Forgot Password - RoleReady',
  description: 'Reset your RoleReady password',
};

export default function ForgotPasswordPage() {
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
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" 
                />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Reset Password
          </h1>
          <p className="text-gray-600">
            Follow the steps to reset your password securely
          </p>
        </div>
        
        {/* Forgot Password Form */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
          <ForgotPasswordForm />
          
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <Link
              href="/login"
              className="text-[#5693C1] hover:text-[#4a80b0] font-medium inline-flex items-center gap-2"
            >
              <svg 
                className="w-4 h-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M10 19l-7-7m0 0l7-7m-7 7h18" 
                />
              </svg>
              Back to Sign In
            </Link>
          </div>
        </div>

        {/* Security Note */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex items-start gap-3">
            <svg 
              className="w-5 h-5 text-[#5693C1] mt-0.5 flex-shrink-0" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
              />
            </svg>
            <div>
              <p className="text-sm text-gray-700">
                <span className="font-medium text-gray-900">Security Notice:</span> We'll send a one-time password (OTP) to your registered email. The OTP will expire in 10 minutes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}