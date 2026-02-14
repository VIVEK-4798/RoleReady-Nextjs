import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy | RoleReady',
    description: 'Learn how RoleReady collects, uses, and protects your personal information.',
};

export default function PrivacyPolicyPage() {
    return (
        <article className="prose prose-slate max-w-none">
            <h1 className="text-4xl font-black text-gray-900 mb-8 tracking-tight">Privacy Policy</h1>
            <p className="text-gray-500 font-medium mb-12">Last Updated: February 14, 2026</p>

            <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                    At RoleReady, we collect information to provide a personalized career readiness experience. This includes:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                    <li><strong>Personal Identifiers:</strong> Name, email address, and profile picture provided during registration.</li>
                    <li><strong>Professional Data:</strong> LinkedIn profile details, resume content, skills, work experience, and educational history.</li>
                    <li><strong>Usage Data:</strong> Information on how you interact with our assessments, roadmaps, and mentorship tools.</li>
                </ul>
            </section>

            <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                    Your data is used to fuel our AI-driven assessment engine and provide tailored recommendations:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                    <li>To calculate your role-readiness scores and identify skill gaps.</li>
                    <li>To generate personalized career roadmaps and learning paths.</li>
                    <li>To facilitate mentorship interactions and skill validation.</li>
                    <li>To process payments and maintain your subscription status.</li>
                </ul>
            </section>

            <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Authentication Providers</h2>
                <p className="text-gray-600 leading-relaxed">
                    We use secure third-party authentication services, including Google and LinkedIn OAuth. When you sign in using these services, they provide us with your name, email, and profile image. We do not store your social media passwords.
                </p>
            </section>

            <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Cookies & Analytics</h2>
                <p className="text-gray-600 leading-relaxed">
                    We use essential cookies to maintain your session and security. We also utilize analytics tools (such as Google Analytics) to understand platform performance. You can manage cookie preferences through your browser settings, though some features may be limited.
                </p>
            </section>

            <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Storage & Security</h2>
                <p className="text-gray-600 leading-relaxed">
                    Your data is stored on secure, encrypted cloud servers. We implement industry-standard security protocols (SSL/TLS) to protect information during transit and at rest. While we strive for absolute security, no method of electronic storage is 100% secure.
                </p>
            </section>

            <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Third-Party Sharing</h2>
                <p className="text-gray-600 leading-relaxed">
                    We do not sell your personal data. We share information only with:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                    <li><strong>Mentors:</strong> Only if you are explicitly assigned to or request validation from a specific mentor.</li>
                    <li><strong>Service Providers:</strong> Payment processors (e.g., Stripe/Razorpay) and database hosting partners.</li>
                    <li><strong>Legal Requirements:</strong> If required by law to comply with judicial proceedings.</li>
                </ul>
            </section>

            <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. User Rights & Data Retention</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                    You have the right to access, correct, or delete your personal information at any time via your Account Settings.
                </p>
                <p className="text-gray-600 leading-relaxed">
                    We retain your data as long as your account is active or as needed to provide you services. If you close your account, we will delete your personal identifiers within 30 days, unless required for legal or audit purposes.
                </p>
            </section>

            <section className="mb-12 p-8 bg-gray-50 rounded-2xl border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
                <p className="text-gray-600 leading-relaxed">
                    For any privacy-related questions, please contact our Data Protection Officer at:<br />
                    <span className="font-bold text-[#5693C1]">privacy@roleready.com</span>
                </p>
            </section>
        </article>
    );
}
