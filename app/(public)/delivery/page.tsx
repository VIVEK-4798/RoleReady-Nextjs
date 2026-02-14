import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Delivery & Access Policy | RoleReady',
    description: 'Learn how you receive access to RoleReady products and services after purchase.',
};

export default function DeliveryPolicyPage() {
    return (
        <article className="prose prose-slate max-w-none">
            <h1 className="text-4xl font-black text-gray-900 mb-8 tracking-tight">Delivery & Access Policy</h1>
            <p className="text-gray-500 font-medium mb-12">Last Updated: February 14, 2026</p>

            <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Digital Delivery Model</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                    RoleReady provides digital services and software-as-a-service (SaaS) products. We <span className="font-bold">do not ship any physical goods</span> or tangible products to your address.
                </p>
                <p className="text-gray-600 leading-relaxed">
                    Access to our platform is provided exclusively via the World Wide Web through the RoleReady dashboard.
                </p>
            </section>

            <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Activation Timeline</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                    Upon successful completion of your payment:
                </p>
                <ul className="list-disc pl-6 space-y-4 text-gray-600">
                    <li><strong>Instant Access:</strong> Your account features will be upgraded automatically and immediately. You will receive a confirmation email within minutes.</li>
                    <li><strong>Dashboard Logic:</strong> You can refresh your dashboard to see the unlocked features (Premium Assessments, Career Roadmaps, etc.).</li>
                    <li><strong>Mentorship:</strong> If your purchase includes direct mentorship, you will be assigned a mentor within 24-48 business hours of completing your onboarding profile.</li>
                </ul>
            </section>

            <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Access Requirements</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                    To access the platform, you must meet the following technical requirements:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                    <li>A valid RoleReady account (registered via Email, Google, or LinkedIn).</li>
                    <li>A stable internet connection.</li>
                    <li>A modern web browser (latest versions of Chrome, Firefox, Safari, or Edge).</li>
                </ul>
            </section>

            <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Service Availability</h2>
                <p className="text-gray-600 leading-relaxed">
                    While we aim for 99.9% uptime, access may be temporarily interrupted for scheduled maintenance or emergency updates. We provide notice of scheduled downtime via the platform dashboard or email.
                </p>
            </section>

            <section className="mb-12 p-8 bg-[#5693C1]/5 rounded-2xl border border-[#5693C1]/20">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Missing Access?</h2>
                <p className="text-gray-600 mb-4 font-medium leading-relaxed">
                    If your payment was successful but you cannot access your premium features within 30 minutes, please contact our support team with your transaction ID.
                </p>
                <div className="flex items-center gap-4">
                    <a
                        href="mailto:roleready.contact@gmail.com"
                        className="px-6 py-3 bg-[#5693C1] text-white font-black rounded-xl hover:shadow-lg transition-all"
                    >
                        Contact Support
                    </a>
                    <span className="text-sm text-gray-400 font-bold uppercase tracking-widest">Typical response: &lt; 2 Hours</span>
                </div>
            </section>
        </article>
    );
}
