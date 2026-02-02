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
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome Back
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Sign in to continue to RoleReady
        </p>
      </div>
      
      <LoginForm />
      
      <div className="mt-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Don&apos;t have an account?{' '}
          <a
            href="/signup"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
