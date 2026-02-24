import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import '@/lib/models/User';
import '@/lib/models/Skill';
import '@/lib/models/UserSkill';
import { initModels } from '@/lib/models';
import { checkResumeEligibility } from '@/services/resume/resumeEligibilityService';
import { buildResumeData } from '@/services/resume/resumeBuilderService';
import ResumeChecklist from '@/components/resume/ResumeChecklist';
import ClientResumePage from './ClientResumePage';
import connectDB from '@/lib/db/mongoose';

export const metadata = {
    title: 'Resume Generator - RoleReady',
    description: 'Generate an ATS-friendly resume from your profile data.',
};

export default async function ResumePage() {
    // Force model initialization at the very start of the page render
    await connectDB();
    initModels();

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
                    missingIds={eligibility.missingIds}
                    warnings={eligibility.warnings}
                />
            </div>
        );
    }

    const resumeData = await buildResumeData(userId);

    return <ClientResumePage initialData={resumeData} eligibility={eligibility} />;
}
