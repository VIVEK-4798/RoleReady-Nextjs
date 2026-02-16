import { Metadata } from 'next';
import JobDetailClient from '@/components/jobs/JobDetailClient';
import { jobAggregatorService } from '@/services/jobs/jobAggregatorService';

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const job = await jobAggregatorService.getJobById(id);

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
