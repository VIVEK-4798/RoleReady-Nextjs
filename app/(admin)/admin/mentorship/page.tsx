/**
 * Mentorship Management Page
 * 
 * Advanced assignment and workload management for mentors.
 */

import { Metadata } from 'next';
import MentorshipClient from './MentorshipClient';

export const metadata: Metadata = {
    title: 'Mentorship | RoleReady Admin',
    description: 'Manage mentor assignments and workload distribution.',
};

export default function MentorshipPage() {
    return (
        <div className="space-y-6">
            <MentorshipClient />
        </div>
    );
}
