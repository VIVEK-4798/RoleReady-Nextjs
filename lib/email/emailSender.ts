/**
 * Email Sender Wrapper
 * 
 * Wrapper around the email utility to match the interface expected by email event service
 */

import { sendEmail as sendEmailUtil } from '@/lib/utils/email';

export interface SendEmailParams {
    to: string;
    subject: string;
    html: string;
}

export async function sendEmail(params: SendEmailParams): Promise<boolean> {
    return sendEmailUtil(params.to, params.subject, params.html);
}
