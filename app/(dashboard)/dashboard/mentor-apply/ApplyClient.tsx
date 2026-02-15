'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import ConsentModal from '@/components/dashboard/ConsentModal';

interface ApplicationData {
    professionalIdentity: {
        linkedinUrl: string;
        githubUrl: string;
        portfolioUrl: string;
        companyEmail: string;
    };
    experience: {
        currentTitle: string;
        yearsOfExperience: number;
        companies: string[];
        domains: string[];
    };
    expertise: {
        primarySkills: string[];
        mentoringAreas: string[];
    };
    workProof: {
        projectLinks: string[];
        achievements: string[];
    };
    intent: {
        motivation: string;
    };
    availability: {
        hoursPerWeek: number;
        preferredMenteeLevel: 'beginner' | 'intermediate' | 'advanced';
    };
    status?: string;
    rejectionReason?: string;
    submittedAt?: string;
    consentAccepted?: boolean;
    consentAcceptedAt?: string;
    consentVersion?: string;
}

const INITIAL_DATA: ApplicationData = {
    professionalIdentity: {
        linkedinUrl: '',
        githubUrl: '',
        portfolioUrl: '',
        companyEmail: '',
    },
    experience: {
        currentTitle: '',
        yearsOfExperience: 0,
        companies: [],
        domains: [],
    },
    expertise: {
        primarySkills: [],
        mentoringAreas: [],
    },
    workProof: {
        projectLinks: [],
        achievements: [],
    },
    intent: {
        motivation: '',
    },
    availability: {
        hoursPerWeek: 0,
        preferredMenteeLevel: 'beginner',
    },
};

export default function ApplyClient() {
    const { data: session } = useSession();
    const router = useRouter();
    const [formData, setFormData] = useState<ApplicationData>(INITIAL_DATA);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [showConsentModal, setShowConsentModal] = useState(false);

    useEffect(() => {
        fetchApplication();
    }, []);

    const fetchApplication = async () => {
        try {
            const res = await fetch('/api/mentor-application/me');
            const data = await res.json();
            if (data.success && data.data) {
                setFormData(data.data);
            }
        } catch (error) {
            console.error('Failed to load application:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveDraft = async () => {
        setSaving(true);
        try {
            // Remove system fields before sending
            const {
                _id, userId, status, createdAt, updatedAt, __v,
                rejectionReason, submittedAt, reviewedAt, reviewedBy,
                consentAccepted, consentAcceptedAt, consentVersion,
                ...cleanData
            } = formData as any;

            const res = await fetch('/api/mentor-application/draft', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cleanData),
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Draft saved successfully');
                // Update local state with any server-side changes if needed, but keep it simple
            } else {
                toast.error(data.message || 'Failed to save draft');
            }
        } catch (error) {
            console.error('Save draft error:', error);
            toast.error('Connection error');
        } finally {
            setSaving(false);
        }
    };

    const submitFinal = async () => {
        if (formData.intent.motivation.length < 50) {
            toast.error('Motivation must be at least 50 characters');
            return;
        }

        // Open consent modal instead of direct submit
        setShowConsentModal(true);
    };

    const handleConfirmConsent = async () => {

        setSubmitting(true);
        try {
            // Step 1: Record Consent
            const consentRes = await fetch('/api/mentor-application/consent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accepted: true, version: 'v1.0' }),
            });
            const consentData = await consentRes.json();

            if (!consentData.success) {
                toast.error(consentData.message || 'Failed to record consent');
                setSubmitting(false);
                return;
            }

            // Step 2: Save current data first
            // Remove system fields before sending
            const {
                _id, userId, status, createdAt, updatedAt, __v,
                rejectionReason, submittedAt, reviewedAt, reviewedBy,
                consentAccepted, consentAcceptedAt, consentVersion,
                ...cleanData
            } = formData as any;

            const saveRes = await fetch('/api/mentor-application/draft', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cleanData),
            });
            const saveData = await saveRes.json();

            if (!saveData.success) {
                console.error('Save failed during submit:', saveData);
                toast.error(saveData.message || 'Failed to save application data');
                setSubmitting(false);
                return;
            }

            // Step 3: Submit
            const res = await fetch('/api/mentor-application/submit', {
                method: 'POST',
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Application submitted for review!');
                router.push('/dashboard'); // Go back to dashboard on success
            } else {
                console.error('Submit failed:', data);
                toast.error(data.message || 'Submission failed');
            }
        } catch (error) {
            console.error('Submit error:', error);
            toast.error('Connection error');
        } finally {
            setSubmitting(false);
            setShowConsentModal(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5693C1]"></div>
            </div>
        );
    }

    const isReadOnly = formData.status === 'submitted' || formData.status === 'approved';

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Mentor Application</h1>
                        <p className="mt-2 text-gray-600">Provide details to help us evaluate your eligibility for the mentor role.</p>
                    </div>
                    {formData.status && (
                        <div className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider ${formData.status === 'draft' ? 'bg-gray-100 text-gray-600' :
                            formData.status === 'submitted' ? 'bg-yellow-100 text-yellow-700' :
                                formData.status === 'approved' ? 'bg-green-100 text-green-700' :
                                    'bg-red-100 text-red-700'
                            }`}>
                            {formData.status}
                        </div>
                    )}
                </div>

                {formData.status === 'rejected' && (
                    <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl">
                        <h3 className="text-red-800 font-bold mb-1">Application Returned</h3>
                        <p className="text-red-700 text-sm">{formData.rejectionReason}</p>
                        <p className="text-red-600 text-xs mt-2 italic">Please update the information below and resubmit.</p>
                    </div>
                )}

                {formData.status === 'approved' && (
                    <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-xl text-center">
                        <h3 className="text-green-800 font-bold text-xl mb-2">Congratulations!</h3>
                        <p className="text-green-700 font-medium">Your application has been approved. You now have mentor access.</p>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition"
                        >
                            Go to Dashboard
                        </button>
                    </div>
                )}

                <div className="space-y-8">
                    {/* Section 1: Professional Identity */}
                    <Section title="1. Professional Identity" description="Links to your professional profiles and work history.">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="LinkedIn Profile URL"
                                placeholder="https://linkedin.com/in/username"
                                value={formData.professionalIdentity.linkedinUrl}
                                disabled={isReadOnly}
                                onChange={(v: string) => setFormData(p => ({ ...p, professionalIdentity: { ...p.professionalIdentity, linkedinUrl: v } }))}
                            />
                            <Input
                                label="GitHub URL"
                                placeholder="https://github.com/username"
                                value={formData.professionalIdentity.githubUrl}
                                disabled={isReadOnly}
                                onChange={(v: string) => setFormData(p => ({ ...p, professionalIdentity: { ...p.professionalIdentity, githubUrl: v } }))}
                            />
                            <Input
                                label="Portfolio URL"
                                placeholder="https://yourportfolio.com"
                                value={formData.professionalIdentity.portfolioUrl}
                                disabled={isReadOnly}
                                onChange={(v: string) => setFormData(p => ({ ...p, professionalIdentity: { ...p.professionalIdentity, portfolioUrl: v } }))}
                            />
                            <Input
                                label="Company Email (Optional)"
                                placeholder="you@company.com"
                                value={formData.professionalIdentity.companyEmail}
                                disabled={isReadOnly}
                                onChange={(v: string) => setFormData(p => ({ ...p, professionalIdentity: { ...p.professionalIdentity, companyEmail: v } }))}
                            />
                        </div>
                    </Section>

                    {/* Section 2: Experience */}
                    <Section title="2. Experience" description="Your current role and career summary.">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Current Title"
                                placeholder="e.g. Senior Software Engineer"
                                value={formData.experience.currentTitle}
                                disabled={isReadOnly}
                                onChange={(v: string) => setFormData(p => ({ ...p, experience: { ...p.experience, currentTitle: v } }))}
                            />
                            <Input
                                label="Years of Experience"
                                type="number"
                                value={formData.experience.yearsOfExperience.toString()}
                                disabled={isReadOnly}
                                onChange={(v: string) => setFormData(p => ({ ...p, experience: { ...p.experience, yearsOfExperience: parseInt(v) || 0 } }))}
                            />
                            <TagsInput
                                label="Notable Companies"
                                placeholder="e.g. Google, Meta, StartupX"
                                tags={formData.experience.companies}
                                disabled={isReadOnly}
                                onChange={(tags: string[]) => setFormData(p => ({ ...p, experience: { ...p.experience, companies: tags } }))}
                            />
                            <TagsInput
                                label="Industry Domains"
                                placeholder="e.g. FinTech, Healthcare, AI"
                                tags={formData.experience.domains}
                                disabled={isReadOnly}
                                onChange={(tags: string[]) => setFormData(p => ({ ...p, experience: { ...p.experience, domains: tags } }))}
                            />
                        </div>
                    </Section>

                    {/* Section 3: Expertise */}
                    <Section title="3. Expertise" description="Skills you can mentor in.">
                        <div className="space-y-6">
                            <TagsInput
                                label="Primary Skills"
                                placeholder="e.g. React, Python, Cloud Arch"
                                tags={formData.expertise.primarySkills}
                                disabled={isReadOnly}
                                onChange={(tags: string[]) => setFormData(p => ({ ...p, expertise: { ...p.expertise, primarySkills: tags } }))}
                            />
                            <TagsInput
                                label="Mentoring Areas"
                                placeholder="e.g. Interview Prep, Career Growth, Technical Deep-dives"
                                tags={formData.expertise.mentoringAreas}
                                disabled={isReadOnly}
                                onChange={(tags: string[]) => setFormData(p => ({ ...p, expertise: { ...p.expertise, mentoringAreas: tags } }))}
                            />
                        </div>
                    </Section>

                    {/* Section 4: Work Proof */}
                    <Section title="4. Work Proof" description="Evidence of your impact and technical contribution.">
                        <div className="space-y-6">
                            <TagsInput
                                label="Project Links"
                                placeholder="Links to open source or public projects"
                                tags={formData.workProof.projectLinks}
                                disabled={isReadOnly}
                                onChange={(tags: string[]) => setFormData(p => ({ ...p, workProof: { ...p.workProof, projectLinks: tags } }))}
                            />
                            <TagsInput
                                label="Key Achievements"
                                placeholder="e.g. Led 10+ devs, Published 5 papers"
                                tags={formData.workProof.achievements}
                                disabled={isReadOnly}
                                onChange={(tags: string[]) => setFormData(p => ({ ...p, workProof: { ...p.workProof, achievements: tags } }))}
                            />
                        </div>
                    </Section>

                    {/* Section 5: Intent */}
                    <Section title="5. Motivation" description="Why do you want to become a mentor?">
                        <textarea
                            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5693C1] focus:border-transparent min-h-[150px] text-gray-900 placeholder-gray-400"
                            placeholder="Minimum 50 characters required..."
                            value={formData.intent.motivation}
                            disabled={isReadOnly}
                            onChange={(e) => setFormData(p => ({ ...p, intent: { ...p.intent, motivation: e.target.value } }))}
                        ></textarea>
                        <div className="flex justify-between items-center mt-2">
                            <p className={`text-xs ${formData.intent.motivation.length < 50 ? 'text-red-500 font-semibold' : 'text-green-600'}`}>
                                {formData.intent.motivation.length} characters
                                {formData.intent.motivation.length < 50 && ` (Minimum 50 required)`}
                            </p>
                        </div>
                    </Section>

                    {/* Section 6: Availability */}
                    <Section title="6. Availability" description="Help us match you with the right mentees.">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Hours Available per Week"
                                type="number"
                                value={formData.availability.hoursPerWeek.toString()}
                                disabled={isReadOnly}
                                onChange={(v: string) => setFormData(p => ({ ...p, availability: { ...p.availability, hoursPerWeek: parseInt(v) || 0 } }))}
                            />
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Preferred Mentee Level</label>
                                <select
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5693C1]"
                                    value={formData.availability.preferredMenteeLevel}
                                    disabled={isReadOnly}
                                    onChange={(e) => setFormData(p => ({ ...p, availability: { ...p.availability, preferredMenteeLevel: e.target.value as any } }))}
                                >
                                    <option value="beginner">Beginner (Students, New Grads)</option>
                                    <option value="intermediate">Intermediate (Associate, Mid-level)</option>
                                    <option value="advanced">Advanced (Senior+)</option>
                                </select>
                            </div>
                        </div>
                    </Section>

                    {/* CTA Area */}
                    {!isReadOnly && (
                        <div className="flex flex-col sm:flex-row justify-end gap-4 p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
                            <button
                                onClick={saveDraft}
                                disabled={saving || submitting}
                                className="px-8 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Save Draft'}
                            </button>
                            <button
                                onClick={submitFinal}
                                disabled={saving || submitting}
                                className="px-8 py-3 bg-gradient-to-r from-[#5693C1] to-blue-500 text-white font-bold rounded-xl hover:shadow-lg transition disabled:opacity-50"
                            >
                                {submitting ? 'Submitting...' : 'Submit Application'}
                            </button>
                        </div>
                    )}

                    {formData.consentAccepted && !isReadOnly && (
                        <p className="text-xs text-green-600 font-semibold text-right px-2 -mt-4 mb-4">
                            ✓ Role Change Consent Signed {formData.consentAcceptedAt && `on ${format(new Date(formData.consentAcceptedAt), 'MMM d, yyyy')}`}
                        </p>
                    )}

                    {formData.status === 'submitted' && (
                        <div className="p-6 bg-yellow-50 border border-yellow-100 rounded-2xl text-center">
                            <p className="text-yellow-800 font-semibold mb-2">Application Submitted</p>
                            <p className="text-yellow-700 text-sm">You applied on {formData.submittedAt && format(new Date(formData.submittedAt), 'MMMM do, yyyy')}. Our team is currently reviewing your credentials.</p>
                        </div>
                    )}
                </div>
            </div>

            <ConsentModal
                isOpen={showConsentModal}
                onClose={() => setShowConsentModal(false)}
                onConfirm={handleConfirmConsent}
                isSubmitting={submitting}
            />
        </div>
    );
}

// Helper Components
function Section({ title, description, children }: { title: string, description: string, children: React.ReactNode }) {
    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-1">{title}</h2>
            <p className="text-gray-500 text-sm mb-6 pb-6 border-b border-gray-50">{description}</p>
            {children}
        </div>
    );
}

function Input({ label, placeholder, value, onChange, type = 'text', disabled = false }: any) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">{label}</label>
            <input
                type={type}
                disabled={disabled}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5693C1] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400 text-gray-900 placeholder-gray-400"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}

function TagsInput({ label, placeholder, tags, onChange, disabled = false }: any) {
    const [current, setCurrent] = useState('');

    const add = () => {
        if (current.trim() && !tags.includes(current.trim())) {
            onChange([...tags, current.trim()]);
            setCurrent('');
        }
    };

    return (
        <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">{label}</label>
            <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-blue-50 text-[#5693C1] text-sm font-medium rounded-lg border border-blue-100 flex items-center gap-2">
                        {tag}
                        {!disabled && (
                            <button onClick={() => onChange(tags.filter((_: any, idx: number) => idx !== i))} className="hover:text-red-500">×</button>
                        )}
                    </span>
                ))}
            </div>
            {!disabled && (
                <div className="flex gap-2">
                    <input
                        className="flex-1 p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5693C1] text-gray-900 placeholder-gray-400"
                        placeholder={placeholder}
                        value={current}
                        onChange={(e) => setCurrent(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
                    />
                    <button onClick={add} className="px-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition">Add</button>
                </div>
            )}
        </div>
    );
}
