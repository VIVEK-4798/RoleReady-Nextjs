import { Metadata } from 'next';
import ImportGithubClient from './ImportGithubClient';
import { auth } from '@/lib/auth/auth'; // Import from auth.ts for extended types
import { redirect } from 'next/navigation';

interface ExtendedUser {
    id: string;
    email: string;
    name: string;
    role: 'user' | 'mentor' | 'admin';
    image?: string;
}

export const metadata: Metadata = {
    title: 'Import Projects from GitHub | RoleReady',
    description: 'Sync your real-world coding projects from GitHub to your professional profile.',
};

export default async function ImportGithubPage() {
    const session = await auth();

    if (!session || !session.user) {
        redirect('/login');
    }

    const user = session.user as unknown as ExtendedUser;

    // Ensure user is a student/user role (adjust if needed)
    if (user?.role !== 'user' && user?.role !== 'admin') {
        redirect('/dashboard');
    }

    return <ImportGithubClient />;
}
