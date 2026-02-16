import { Metadata } from 'next';
import InternshipsClient from '@/components/internships/InternshipsClient';

export const metadata: Metadata = {
    title: 'Internship Discovery | RoleReady',
    description: 'Find internship opportunities matching your career goals. Gain real-world experience and evaluate your readiness before applying.',
};

export default function InternshipsPage() {
    return <InternshipsClient />;
}
