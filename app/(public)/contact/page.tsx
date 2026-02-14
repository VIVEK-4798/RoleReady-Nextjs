import { Metadata } from 'next';
import Link from 'next/link';
import { auth } from '@/lib/auth';

export const metadata: Metadata = {
    title: 'Contact Us | RoleReady',
    description: 'Get in touch with the RoleReady support team for help with your career assessments and mentorship.',
};

export default async function ContactUsPage() {
    const session = await auth();
    const isAuthenticated = !!session?.user;

    return (
        <div className="space-y-12 max-w-5xl mx-auto">
            <div className="text-center md:text-left space-y-4">
                <h1 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tight">Contact Us</h1>
                <p className="text-xl text-gray-500 max-w-2xl font-medium leading-relaxed">
                    Have questions about the platform? We provide dedicated support through our internal ticket system for faster resolution.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Contact info cards */}
                <div className="space-y-6">
                    <div className="p-8 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow group">
                        <div className="w-14 h-14 bg-blue-50 text-[#5693C1] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Email Support</h3>
                        <p className="text-gray-500 mb-4 font-medium leading-relaxed">
                            For business inquiries or if you cannot access your account.
                        </p>
                        <a href="mailto:roleready.contact@gmail.com" className="text-lg font-black text-[#5693C1] hover:underline transition-all">
                            roleready.contact@gmail.com
                        </a>
                        <div className="mt-4 flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            Typical Response: 2-4 Hours
                        </div>
                    </div>

                    <div className="p-8 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow group text-left">
                        <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Registered Office</h3>
                        <p className="text-gray-500 font-medium leading-relaxed">
                            RoleReady Technologies Private Limited<br />
                            Bengaluru, Karnataka 560001<br />
                            India
                        </p>
                    </div>
                </div>

                {/* Direct Action Card */}
                <div className="bg-gray-900 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#5693C1]/10 rounded-full -mr-16 -mt-16 blur-3xl transition-all group-hover:bg-[#5693C1]/20" />

                    <div className="relative z-10 space-y-6">
                        <div className={`p-4 rounded-2xl inline-block ${isAuthenticated ? 'bg-green-500/10 text-green-400' : 'bg-[#5693C1]/10 text-[#5693C1]'}`}>
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                            </svg>
                        </div>

                        <h2 className="text-3xl font-black text-white leading-tight">
                            {isAuthenticated ? 'Need Technical Support?' : 'Already a Member?'}
                        </h2>
                        <p className="text-gray-400 font-medium leading-relaxed">
                            {isAuthenticated
                                ? 'Raise a support ticket directly from your dashboard for instant attention from our specialized support team.'
                                : 'Login to your dashboard to raise support tickets, manage your assessments, and talk directly to your mentors.'}
                        </p>

                        <Link
                            href={isAuthenticated ? '/dashboard/tickets' : '/login'}
                            className="block w-full py-5 bg-[#5693C1] text-white text-center font-black rounded-2xl hover:bg-[#4a80b0] transition-all hover:shadow-xl hover:-translate-y-1 active:scale-95"
                        >
                            {isAuthenticated ? 'Go to Support Tickets' : 'Login to Your Dashboard'}
                        </Link>
                    </div>
                </div>
            </div>

            <div className="p-8 bg-blue-50 border border-blue-100 rounded-3xl text-center">
                <p className="text-sm font-bold text-blue-800 uppercase tracking-[0.15em] mb-2">Live Chat Support</p>
                <p className="text-blue-600 font-medium">Looking for quick answers? Click the chat bubble in the bottom right corner to speak with us live.</p>
            </div>
        </div>
    );
}
