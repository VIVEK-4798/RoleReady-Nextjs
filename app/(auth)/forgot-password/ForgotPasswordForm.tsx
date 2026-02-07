/**
 * Forgot Password Form Component
 * 
 * Multi-step form for password reset:
 * 1. Enter email and role
 * 2. Receive and enter OTP
 * 3. Set new password
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/hooks';

type Step = 'email' | 'otp' | 'password';

const roles: { value: UserRole; label: string }[] = [
  { value: 'user', label: 'Job Seeker' },
  { value: 'mentor', label: 'Mentor' },
  { value: 'admin', label: 'Admin' },
];

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [formData, setFormData] = useState({
    email: '',
    role: 'user' as UserRole,
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          role: formData.role,
          purpose: 'password-reset',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to send OTP');
        setIsLoading(false);
        return;
      }

      setSuccess('OTP sent to your email');
      setStep('otp');
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          role: formData.role,
          otp: formData.otp,
          purpose: 'password-reset',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Invalid OTP');
        setIsLoading(false);
        return;
      }

      setResetToken(data.data.resetToken);
      setSuccess('OTP verified');
      setStep('password');
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          role: formData.role,
          resetToken,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to reset password');
        setIsLoading(false);
        return;
      }

      setSuccess('Password reset successfully! Redirecting to login...');
      
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Progress indicator
  const stepLabels = ['Enter Email', 'Verify OTP', 'New Password'];
  const currentStepIndex = ['email', 'otp', 'password'].indexOf(step);

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-between mb-8">
        {stepLabels.map((label, index) => (
          <div key={label} className="flex flex-col items-center flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
              index <= currentStepIndex
                ? 'bg-[#5693C1] text-white'
                : 'bg-gray-200 text-gray-400'
            }`}>
              {index + 1}
            </div>
            <span className={`text-xs font-medium ${
              index <= currentStepIndex ? 'text-[#5693C1]' : 'text-gray-400'
            }`}>
              {label}
            </span>
          </div>
        ))}
      </div>

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

      {/* Step 1: Email */}
      {step === 'email' && (
        <form onSubmit={handleSendOtp} className="space-y-5">
          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Account Type
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent"
            >
              {roles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>

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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent"
            />
          </div>

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
                Sending OTP...
              </span>
            ) : 'Send OTP'}
          </button>
        </form>
      )}

      {/* Step 2: OTP */}
      {step === 'otp' && (
        <form onSubmit={handleVerifyOtp} className="space-y-5">
          <div>
            <label
              htmlFor="otp"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Enter OTP
            </label>
            <input
              type="text"
              id="otp"
              name="otp"
              value={formData.otp}
              onChange={handleChange}
              placeholder="123456"
              required
              maxLength={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent text-center text-2xl tracking-widest"
            />
            <p className="mt-3 text-sm text-gray-500">
              Enter the 6-digit code sent to <span className="font-medium text-gray-900">{formData.email}</span>
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Didn't receive the code? Check your spam folder or request a new code.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-[#5693C1] hover:bg-[#4a80b0] disabled:bg-[#8ab4d8] text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:ring-offset-2 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org2000/svg"
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
                Verifying...
              </span>
            ) : 'Verify OTP'}
          </button>

          <button
            type="button"
            onClick={() => setStep('email')}
            className="w-full py-2 text-gray-600 hover:text-[#5693C1] font-medium"
          >
            Resend OTP
          </button>
        </form>
      )}

      {/* Step 3: New Password */}
      {step === 'password' && (
        <form onSubmit={handleResetPassword} className="space-y-5">
          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent"
            />
            <p className="mt-2 text-xs text-gray-500">
              Must be at least 6 characters
            </p>
          </div>

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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent"
            />
          </div>

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
                Resetting...
              </span>
            ) : 'Reset Password'}
          </button>
        </form>
      )}
    </div>
  );
}