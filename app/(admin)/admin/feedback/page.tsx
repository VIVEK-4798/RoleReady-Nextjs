import { Metadata } from 'next';
import AdminFeedbackClient from './AdminFeedbackClient';

export const metadata: Metadata = {
    title: 'Feedback Management | RoleReady Admin',
    description: 'Review and manage platform feedback submissions.',
};

export default function AdminFeedbackPage() {
    return <AdminFeedbackClient />;
}
