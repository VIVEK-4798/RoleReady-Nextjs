/**
 * OTP Utility Functions
 * 
 * Provides secure OTP generation, hashing, and verification.
 * Production-ready with proper error handling.
 */

import crypto from 'crypto';

/**
 * Generate a secure 6-digit OTP
 * Uses crypto.randomInt for cryptographically secure random numbers
 */
export function generateOTP(): string {
    // Generate random number between 100000 and 999999
    const otp = crypto.randomInt(100000, 1000000);
    return otp.toString();
}

/**
 * Hash an OTP using SHA-256
 * Fast and secure for OTP hashing (OTPs are short-lived)
 * 
 * @param otp - Plain text OTP to hash
 * @returns Hashed OTP as hex string
 */
export function hashOTP(otp: string): string {
    return crypto
        .createHash('sha256')
        .update(otp)
        .digest('hex');
}

/**
 * Verify an OTP against its hash
 * Constant-time comparison to prevent timing attacks
 * 
 * @param plainOTP - User-provided OTP
 * @param hashedOTP - Stored OTP hash
 * @returns true if OTP matches, false otherwise
 */
export function verifyOTP(plainOTP: string, hashedOTP: string): boolean {
    const inputHash = hashOTP(plainOTP);

    // Use timingSafeEqual for constant-time comparison
    // Prevents timing attacks
    try {
        const inputBuffer = Buffer.from(inputHash, 'hex');
        const storedBuffer = Buffer.from(hashedOTP, 'hex');

        if (inputBuffer.length !== storedBuffer.length) {
            return false;
        }

        return crypto.timingSafeEqual(inputBuffer, storedBuffer);
    } catch (error) {
        console.error('OTP verification error:', error);
        return false;
    }
}

/**
 * Calculate OTP expiry time
 * Default: 10 minutes from now
 * 
 * @param minutes - Minutes until expiry (default: 10)
 * @returns Date object representing expiry time
 */
export function getOTPExpiry(minutes: number = 10): Date {
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + minutes);
    return expiry;
}

/**
 * Check if OTP has expired
 * 
 * @param expiresAt - Expiry date
 * @returns true if expired, false otherwise
 */
export function isOTPExpired(expiresAt: Date): boolean {
    return new Date() > new Date(expiresAt);
}

/**
 * Sanitize email for consistent comparison
 * 
 * @param email - Email to sanitize
 * @returns Lowercase, trimmed email
 */
export function sanitizeEmail(email: string): string {
    return email.toLowerCase().trim();
}
