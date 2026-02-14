import { Metadata } from 'next';
import MentorValidationsClient from './MentorValidationsClient';

export const metadata: Metadata = {
    title: 'Validation Queue | Mentor Dashboard',
    description: 'Review and validate pending skills for your assigned learners.',
};

export default function MentorValidationsPage() {
    return <MentorValidationsClient />;
}
