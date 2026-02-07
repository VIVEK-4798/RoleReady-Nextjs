/**
 * Signup Form Component
 * 
 * Client component handling signup form state and submission.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupForm() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    mobile: '',
    role: 'user' as 'user' | 'mentor',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleRoleChange = (role: 'user' | 'mentor') => {
    setFormData((prev) => ({ ...prev, role }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          mobile: formData.mobile,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || data.message || 'Signup failed');
        setIsLoading(false);
        return;
      }

      setSuccess('Account created successfully! Redirecting to login...');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Signup error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          {success}
        </div>
      )}

      {/* Name Input */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Full Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="John Doe"
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent transition-colors"
        />
      </div>

      {/* Role Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          I want to register as *
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleRoleChange('user')}
            className={`relative flex items-center justify-center px-4 py-4 border-2 rounded-lg cursor-pointer transition-all ${
              formData.role === 'user'
                ? 'border-[#5693C1] bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="flex flex-col items-center">
              <svg 
                className={`w-6 h-6 mb-2 ${formData.role === 'user' ? 'text-[#5693C1]' : 'text-gray-400'}`}
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
              <span className={`text-base font-medium ${formData.role === 'user' ? 'text-[#5693C1]' : 'text-gray-900'}`}>
                Job Seeker
              </span>
              <span className="text-xs text-gray-500 mt-1 text-center">
                Looking for career guidance
              </span>
            </div>
          </button>
          
          <button
            type="button"
            onClick={() => handleRoleChange('mentor')}
            className={`relative flex items-center justify-center px-4 py-4 border-2 rounded-lg cursor-pointer transition-all ${
              formData.role === 'mentor'
                ? 'border-[#5693C1] bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="flex flex-col items-center">
              <svg 
                className={`w-6 h-6 mb-2 ${formData.role === 'mentor' ? 'text-[#5693C1]' : 'text-gray-400'}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" 
                />
              </svg>
              <span className={`text-base font-medium ${formData.role === 'mentor' ? 'text-[#5693C1]' : 'text-gray-900'}`}>
                Mentor
              </span>
              <span className="text-xs text-gray-500 mt-1 text-center">
                Guide and validate skills
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Email Input */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Email Address
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="you@example.com"
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent transition-colors"
        />
      </div>

      {/* Mobile Input */}
      <div>
        <label
          htmlFor="mobile"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Mobile Number{' '}
          <span className="text-gray-500 font-normal">(optional)</span>
        </label>
        <input
          type="tel"
          id="mobile"
          name="mobile"
          value={formData.mobile}
          onChange={handleChange}
          placeholder="+91 98765 43210"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent transition-colors"
        />
      </div>

      {/* Password Input */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          required
          minLength={6}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent transition-colors"
        />
        <p className="mt-2 text-xs text-gray-500">
          Must be at least 6 characters
        </p>
      </div>

      {/* Confirm Password Input */}
      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Confirm Password
        </label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="••••••••"
          required
          minLength={6}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent transition-colors"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 px-4 bg-[#5693C1] hover:bg-[#4a80b0] disabled:bg-[#8ab4d8] text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:ring-offset-2 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Creating account...
          </span>
        ) : (
          'Create Account'
        )}
      </button>

      {/* Terms */}
      <p className="text-xs text-center text-gray-500 pt-4 border-t border-gray-200">
        By signing up, you agree to our{' '}
        <a href="/terms" className="text-[#5693C1] hover:text-[#4a80b0] font-medium">
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="/privacy" className="text-[#5693C1] hover:text-[#4a80b0] font-medium">
          Privacy Policy
        </a>
      </p>
    </form>
  );
}