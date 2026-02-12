/**
 * Admin Email Management Page
 * 
 * Allows admins to send emails to single or multiple recipients.
 */

import { Metadata } from 'next';
import AdminEmailClient from './AdminEmailClient';

export const metadata: Metadata = {
    title: 'Email Management | RoleReady Admin',
    description: 'Send emails to users individually or in bulk.',
};

export default function AdminEmailPage() {
    return <AdminEmailClient />;
}
