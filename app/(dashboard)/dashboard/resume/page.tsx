import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { checkResumeEligibility } from '@/services/resume/resumeEligibilityService';
import { buildResumeData } from '@/services/resume/resumeBuilderService';
import ResumeChecklist from '@/components/resume/ResumeChecklist';
import ClientResumePage from './ClientResumePage';

export const metadata = {
    title: 'Resume Generator - RoleReady',
    description: 'Generate an ATS-friendly resume from your profile data.',
};

export default async function ResumePage() {
    const session = await auth();
    if (!session?.user?.id) {
        redirect('/login');
    }

    const userId = session.user.id;
    const eligibility = await checkResumeEligibility(userId);

    if (!eligibility.eligible) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center p-4">
                <ResumeChecklist
                    missingFields={eligibility.missingFields}
                    warnings={eligibility.warnings}
                />
            </div>
        );
    }

    const resumeData = await buildResumeData(userId);

    return <ClientResumePage initialData={resumeData} />;
}
