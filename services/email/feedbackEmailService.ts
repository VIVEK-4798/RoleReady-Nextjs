import { sendEmail } from '@/lib/utils/email';

interface FeedbackEmailParams {
    email: string;
    type: string;
}

/**
 * Send a thank you email after feedback submission
 */
export async function sendFeedbackThankYouEmail({ email, type }: FeedbackEmailParams): Promise<boolean> {
    const subject = 'Thank You for Your Feedback – RoleReady';

    // Format the type for better display (e.g., "suggestion" -> "Suggestion")
    const formattedType = type.charAt(0).toUpperCase() + type.slice(1);

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank You for Your Feedback</title>
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
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Hi,
              </p>
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Thank you for sharing your <strong>${formattedType}</strong> with us. We truly appreciate you taking the time to help improve RoleReady.
              </p>
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Our team reviews every submission carefully to ensure we provide the best experience for our community.
              </p>
              <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                If your feedback requires follow-up, we may reach out via this email address.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 10px 0;">
                    <a href="${process.env.NEXTAUTH_URL || 'https://roleready.com'}" 
                       style="display: inline-block; padding: 14px 28px; background-color: #5693C1; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px; box-shadow: 0 4px 6px rgba(86, 147, 193, 0.2);">
                      Visit RoleReady
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 30px 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                Best regards,<br>
                <strong>Team RoleReady</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="margin: 0 0 10px; color: #999999; font-size: 12px;">
                This is an automated thank you email for your feedback.
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
Hi,

Thank you for sharing your ${formattedType} with us. We truly appreciate you taking the time to help improve RoleReady.

Our team reviews every submission carefully. If your feedback requires follow-up, we may reach out via this email.

Visit RoleReady: ${process.env.NEXTAUTH_URL || 'https://roleready.com'}

— Team RoleReady
    `;

    return sendEmail(email, subject, html, text);
}
