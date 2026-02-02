/**
 * Forgot Password Page
 * 
 * Password reset flow with OTP verification.
 */

import { Metadata } from 'next';
import ForgotPasswordForm from './ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Forgot Password - RoleReady',
  description: 'Reset your RoleReady password',
};

export default function ForgotPasswordPage() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Reset Password
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Enter your email to receive a password reset OTP
        </p>
      </div>
      
      <ForgotPasswordForm />
      
      <div className="mt-6 text-center">
        <a
          href="/login"
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          ← Back to Sign In
        </a>
      </div>
    </div>
  );
}
