import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms & Conditions | RoleReady',
    description: 'Review the terms of service for using the RoleReady platform.',
};

export default function TermsPage() {
    return (
        <article className="prose prose-slate max-w-none">
            <h1 className="text-4xl font-black text-gray-900 mb-8 tracking-tight">Terms & Conditions</h1>
            <p className="text-gray-500 font-medium mb-12">Last Updated: February 14, 2026</p>

            <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                <p className="text-gray-600 leading-relaxed">
                    By accessing or using the RoleReady platform ("the Service"), you agree to be bound by these Terms & Conditions. If you do not agree to any part of these terms, you may not access the Service.
                </p>
            </section>

            <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
                <p className="text-gray-600 leading-relaxed">
                    RoleReady provides an AI-driven job readiness and mentorship platform. Our services include skill assessments, career roadmapping, professional mentorship, and analytics. We provide digital services and do not ship physical products.
                </p>
            </section>

            <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Account Responsibility</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                    To use certain features, you must register for an account. You are responsible for:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                    <li>Maintaining the confidentiality of your account credentials.</li>
                    <li>Providing accurate and complete profile information.</li>
                    <li>All activities that occur under your account.</li>
                </ul>
            </section>

            <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. User Conduct</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                    You agree not to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                    <li>Use the platform for any illegal or unauthorized purpose.</li>
                    <li>Attempt to reverse engineer or decompile the assessment algorithms.</li>
                    <li>Submit false credentials or plagiarized work for skill validation.</li>
                    <li>Harass or abuse mentors or other users on the platform.</li>
                </ul>
            </section>

            <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Intellectual Property</h2>
                <p className="text-gray-600 leading-relaxed font-semibold mb-4">
                    The Service and its original content, features, and functionality are the exclusive property of RoleReady and its licensors.
                </p>
                <p className="text-gray-600 leading-relaxed font-semibold">
                    Your personal data and uploaded resumes remain your property. However, you grant RoleReady a non-exclusive license to process this data for the purpose of providing services to you.
                </p>
            </section>

            <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Payments & Billing</h2>
                <p className="text-gray-600 leading-relaxed">
                    Certain features are subject to payment. All fees are in the currency specified at the time of purchase. You agree to provide valid payment information. Subscriptions are billed in advance and may renew automatically unless cancelled in accordance with our Refund & Cancellation policy.
                </p>
            </section>

            <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Termination</h2>
                <p className="text-gray-600 leading-relaxed">
                    We reserves the right to terminate or suspend your account immediately, without prior notice or liability, if you breach these Terms. Upon termination, your right to use the Service will cease immediately.
                </p>
            </section>

            <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Limitation of Liability</h2>
                <p className="text-gray-600 leading-relaxed">
                    RoleReady and its mentors shall not be liable for any indirect, incidental, special, or consequential damages resulting from your use of the platform, including but not limited to career outcomes, job placement results, or data loss.
                </p>
            </section>

            <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Governing Law</h2>
                <p className="text-gray-600 leading-relaxed font-semibold">
                    These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions.
                </p>
            </section>

            <section className="mb-12 p-8 bg-gray-50 rounded-2xl border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions?</h2>
                <p className="text-gray-600 leading-relaxed">
                    If you have any questions about these Terms, please contact us at:<br />
                    <span className="font-bold text-[#5693C1]">legal@roleready.com</span>
                </p>
            </section>
        </article>
    );
}
