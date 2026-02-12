/**
 * Email Utility
 * 
 * Reusable email sender using Nodemailer.
 * Production-ready with proper error handling and validation.
 */

import nodemailer from 'nodemailer';

// Email configuration from environment variables
const SMTP_CONFIG = {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
    },
};

const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@roleready.com';

/**
 * Create nodemailer transporter
 * Reuses connection for better performance
 */
let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
    if (!transporter) {
        transporter = nodemailer.createTransport(SMTP_CONFIG);
    }
    return transporter;
}

/**
 * Verify SMTP configuration
 * Call this on server startup to ensure email is configured
 */
export async function verifyEmailConfig(): Promise<boolean> {
    try {
        const transport = getTransporter();
        await transport.verify();
        console.log('✅ Email configuration verified');
        return true;
    } catch (error) {
        console.error('❌ Email configuration error:', error);
        return false;
    }
}

/**
 * Send email
 * Generic email sender for all email types
 * 
 * @param to - Recipient email address
 * @param subject - Email subject
 * @param html - HTML email body
 * @param text - Plain text email body (fallback)
 * @returns true if sent successfully, false otherwise
 */
export async function sendEmail(
    to: string,
    subject: string,
    html: string,
    text?: string
): Promise<boolean> {
    try {
        // Validate inputs
        if (!to || !subject || !html) {
            console.error('Email validation failed: missing required fields');
            return false;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(to)) {
            console.error('Email validation failed: invalid email format');
            return false;
        }

        const transport = getTransporter();

        const mailOptions = {
            from: EMAIL_FROM,
            to,
            subject,
            html,
            text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
        };

        const info = await transport.sendMail(mailOptions);
        console.log('✅ Email sent successfully:', info.messageId);
        return true;
    } catch (error) {
        console.error('❌ Email send error:', error);
        return false;
    }
}

/**
 * Send password reset OTP email
 * 
 * @param to - Recipient email
 * @param otp - 6-digit OTP code
 * @param expiryMinutes - Minutes until OTP expires
 * @returns true if sent successfully
 */
export async function sendPasswordResetOTP(
    to: string,
    otp: string,
    expiryMinutes: number = 10
): Promise<boolean> {
    const subject = 'Password Reset OTP - RoleReady';

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset OTP</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #5693C1 0%, #4a80b0 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">RoleReady</h1>
              <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">Password Reset Request</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Hello,
              </p>
              <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                We received a request to reset your password. Use the following One-Time Password (OTP) to complete the process:
              </p>

              <!-- OTP Box -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <div style="display: inline-block; background-color: #f8f9fa; border: 2px dashed #5693C1; border-radius: 8px; padding: 20px 40px;">
                      <p style="margin: 0; color: #666666; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: 500;">Your OTP Code</p>
                      <p style="margin: 10px 0 0; color: #5693C1; font-size: 36px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</p>
                    </div>
                  </td>
                </tr>
              </table>

              <p style="margin: 30px 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                This OTP will expire in <strong>${expiryMinutes} minutes</strong>.
              </p>

              <!-- Warning Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px; margin: 20px 0;">
                <tr>
                  <td style="padding: 15px 20px;">
                    <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.6;">
                      <strong>⚠️ Security Notice:</strong><br>
                      If you didn't request this password reset, please ignore this email and ensure your account is secure.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 30px 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                Best regards,<br>
                <strong>The RoleReady Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="margin: 0 0 10px; color: #999999; font-size: 12px;">
                This is an automated email. Please do not reply.
              </p>
              <p style="margin: 0; color: #999999; font-size: 12px;">
                © ${new Date().getFullYear()} RoleReady. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

    const text = `
RoleReady - Password Reset OTP

Hello,

We received a request to reset your password. Use the following OTP to complete the process:

OTP: ${otp}

This OTP will expire in ${expiryMinutes} minutes.

If you didn't request this password reset, please ignore this email.

Best regards,
The RoleReady Team
  `;

    return sendEmail(to, subject, html, text);
}

/**
 * Send password reset success email
 * 
 * @param to - Recipient email
 * @returns true if sent successfully
 */
export async function sendPasswordResetSuccess(to: string): Promise<boolean> {
    const subject = 'Password Reset Successful - RoleReady';

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Successful</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <tr>
            <td style="background: linear-gradient(135deg, #28a745 0%, #20873a 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">✓ Password Reset Successful</h1>
            </td>
          </tr>

          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Hello,
              </p>
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Your password has been successfully reset. You can now log in with your new password.
              </p>
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                If you did not perform this action, please contact our support team immediately.
              </p>
              <p style="margin: 30px 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                Best regards,<br>
                <strong>The RoleReady Team</strong>
              </p>
            </td>
          </tr>

          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="margin: 0; color: #999999; font-size: 12px;">
                © ${new Date().getFullYear()} RoleReady. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

    const text = `
RoleReady - Password Reset Successful

Hello,

Your password has been successfully reset. You can now log in with your new password.

If you did not perform this action, please contact our support team immediately.

Best regards,
The RoleReady Team
  `;

    return sendEmail(to, subject, html, text);
}
