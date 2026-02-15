import { Metadata } from 'next';
import JobsClient from '@/components/jobs/JobsClient';

export const metadata: Metadata = {
    title: 'Job Opportunities | RoleReady',
    description: 'Discover job opportunities matching your goals and evaluate your readiness before you apply.',
};

export default function JobsPage() {
    return <JobsClient />;
}
