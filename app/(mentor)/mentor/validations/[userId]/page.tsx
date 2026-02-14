import { Metadata } from 'next';
import UserValidationDetailsClient from './UserValidationDetailsClient';

export const metadata: Metadata = {
    title: 'Review Skills | Mentor Dashboard',
    description: 'Review and validate pending skills for a specific student.',
};

export default async function UserValidationDetailsPage({ params }: { params: Promise<{ userId: string }> }) {
    const { userId } = await params;
    return <UserValidationDetailsClient userId={userId} />;
}
