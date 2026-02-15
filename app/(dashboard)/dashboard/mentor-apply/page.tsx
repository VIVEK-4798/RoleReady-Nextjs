import { Metadata } from 'next';
import ApplyClient from './ApplyClient';

export const metadata: Metadata = {
    title: 'Apply to Become a Mentor | RoleReady',
    description: 'Join our elite network of mentors and help shape the next generation of professional talent.',
};

export default function MentorApplyPage() {
    return <ApplyClient />;
}
