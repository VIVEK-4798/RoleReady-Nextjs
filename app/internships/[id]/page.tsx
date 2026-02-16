import { Metadata } from 'next';
import InternshipDetailClient from '@/components/internships/InternshipDetailClient';
import { internshipAggregatorService } from '@/services/internships/internshipAggregatorService';

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const intern = await internshipAggregatorService.getInternshipById(id);

    if (!intern) {
        return {
            title: 'Internship Not Found | RoleReady',
        };
    }

    return {
        title: `${intern.title} Internship at ${intern.company} | RoleReady`,
        description: `View internship details for ${intern.title} at ${intern.company}. Explore stipends, locations, and application links.`,
    };
}

export default function InternshipDetailPage() {
    return <InternshipDetailClient />;
}
