import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Refund & Cancellation | RoleReady',
    description: 'Understand the refund and cancellation policies for RoleReady subscriptions and services.',
};

export default function RefundPolicyPage() {
    return (
        <article className="prose prose-slate max-w-none">
            <h1 className="text-4xl font-black text-gray-900 mb-8 tracking-tight text-center lg:text-left">Refund & Cancellation Policy</h1>
            <p className="text-gray-500 font-medium mb-12 text-center lg:text-left">Effective Date: February 14, 2026</p>

            <section className="mb-12">
                <div className="p-6 bg-blue-50 border border-blue-100 rounded-2xl mb-8">
                    <p className="text-[#5693C1] font-bold flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Service Summary: Digital Subscription
                    </p>
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                        RoleReady is a SaaS platform providing immediate access to digital tools, assessments, and mentorship. Because these services are consumed instantly upon activation, our refund policy reflects the digital nature of the platform.
                    </p>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Subscription Nature</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                    RoleReady offers monthly, quarterly, and annual subscription plans. Your subscription provides unlimited access to assessment tools and platform analytics for the duration of the billing cycle.
                </p>
            </section>

            <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Refund Eligibility</h2>
                <ul className="list-disc pl-6 space-y-4 text-gray-600">
                    <li><strong>Trial Periods:</strong> If we offer a trial period, you will not be charged if you cancel before the trial expires. No refunds are issued for trials that convert to paid subscriptions.</li>
                    <li><strong>Technical Failures:</strong> Refunds may be granted if a critical technical error prevents you from accessing the service for more than 48 consecutive hours, and our support team is unable to resolve it.</li>
                    <li><strong>Duplicate Payments:</strong> In the event of a duplicate transaction due to a billing system error, we will issue a full refund for the duplicate charge immediately.</li>
                </ul>
            </section>

            <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Cancellation Method</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                    You can cancel your subscription at any time through your <span className="font-bold">Account Settings &gt; Billing</span> section.
                </p>
                <p className="text-gray-600 leading-relaxed">
                    Upon cancellation, you will continue to have full access to the platform until the end of your current billing period. No further charges will be made.
                </p>
            </section>

            <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Effect of Cancellation</h2>
                <p className="text-gray-600 leading-relaxed">
                    After a subscription expires following cancellation, your progress data, assessment history, and roadmaps will be archived. You can reactivate your account at any time to restore access to this data.
                </p>
            </section>

            <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Exceptions</h2>
                <p className="text-gray-600 leading-relaxed">
                    Refunds are <span className="underline decoration-red-300 font-bold text-gray-900">not</span> available for:
                </p>
                <ul className="list-disc pl-6 mt-4 space-y-2 text-gray-600">
                    <li>Partially used subscription periods.</li>
                    <li>Accidental purchases if the platform has been accessed.</li>
                    <li>Dissatisfaction with mentorship advice, as mentorship results are subjective to user effort.</li>
                </ul>
            </section>

            <section className="mb-12 p-8 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Request a Refund</h2>
                    <p className="text-gray-600 mb-4">
                        If you believe you are eligible for a refund based on the criteria above, please email our billing department.
                    </p>
                    <a href="mailto:billing@roleready.com" className="text-xl font-black text-[#5693C1] hover:underline">
                        billing@roleready.com
                    </a>
                </div>
                <div className="w-16 h-16 bg-white border border-gray-100 rounded-2xl flex items-center justify-center shadow-sm">
                    <svg className="w-8 h-8 text-[#5693C1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>
            </section>
        </article>
    );
}
