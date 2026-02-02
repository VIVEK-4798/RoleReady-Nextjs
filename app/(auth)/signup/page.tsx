/**
 * Signup Page
 * 
 * User registration page.
 */

import { Metadata } from 'next';
import SignupForm from './SignupForm';

export const metadata: Metadata = {
  title: 'Sign Up - RoleReady',
  description: 'Create your RoleReady account',
};

export default function SignupPage() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Create Account
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Start your journey to job readiness
        </p>
      </div>
      
      <SignupForm />
      
      <div className="mt-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <a
            href="/login"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
