/**
 * Admin Email Utility
 * 
 * Handles sending emails to single or multiple recipients.
 * Used by admin email sending system.
 */

import { sendEmail } from '../utils/email';

export interface EmailResult {
    email: string;
    success: boolean;
    error?: string;
}

export interface BulkEmailResult {
    sent: number;
    failed: number;
    results: EmailResult[];
}

/**
 * Send email to a single recipient
 */
export async function sendAdminEmail(
    recipient: string,
    subject: string,
    content: string
): Promise<boolean> {
    try {
        // Create HTML email
        const html = createEmailHTML(subject, content);

        // Send email
        const success = await sendEmail(recipient, subject, html, content);

        return success;
    } catch (error) {
        console.error(`Failed to send email to ${recipient}:`, error);
        return false;
    }
}

/**
 * Send emails to multiple recipients in batches
 * 
 * @param recipients - Array of email addresses
 * @param subject - Email subject
 * @param content - Email content
 * @param batchSize - Number of emails to send concurrently (default: 10)
 * @returns Results with success/failure counts
 */
export async function sendBulkEmails(
    recipients: string[],
    subject: string,
    content: string,
    batchSize: number = 10
): Promise<BulkEmailResult> {
    const results: EmailResult[] = [];

    // Process in batches to avoid overwhelming the SMTP server
    for (let i = 0; i < recipients.length; i += batchSize) {
        const batch = recipients.slice(i, i + batchSize);

        // Send batch concurrently
        const batchPromises = batch.map(async (email) => {
            try {
                const success = await sendAdminEmail(email, subject, content);
                return {
                    email,
                    success,
                    error: success ? undefined : 'Failed to send email',
                };
            } catch (error) {
                return {
                    email,
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error',
                };
            }
        });

        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);

        // Small delay between batches to avoid rate limiting
        if (i + batchSize < recipients.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    // Calculate statistics
    const sent = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return {
        sent,
        failed,
        results,
    };
}

/**
 * Create HTML email template
 */
function createEmailHTML(subject: string, content: string): string {
    // Convert plain text content to HTML with line breaks
    const htmlContent = content
        .split('\n')
        .map(line => `<p style="margin: 0 0 16px; color: #333333; font-size: 16px; line-height: 1.6;">${escapeHtml(line)}</p>`)
        .join('');

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subject)}</title>
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
              ${htmlContent}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="margin: 0 0 10px; color: #999999; font-size: 12px;">
                This email was sent by RoleReady Admin.
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
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
    const map: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}
