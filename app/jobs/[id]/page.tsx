import { Metadata } from 'next';
import JobDetailClient from '@/components/jobs/JobDetailClient';
import { getJobById } from '@/services/jobs/joinriseService';

interface PageProps {
    params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const job = await getJobById(params.id);

    if (!job) {
        return {
            title: 'Job Not Found | RoleReady',
        };
    }

    return {
        title: `${job.title} at ${job.company} | RoleReady`,
        description: `View details for ${job.title} at ${job.company}. Evaluate your readiness and apply on the employer's official site.`,
    };
}

export default function JobDetailPage() {
    return <JobDetailClient />;
}
