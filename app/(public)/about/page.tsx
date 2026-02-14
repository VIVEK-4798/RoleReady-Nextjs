import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'About Us | RoleReady',
    description: 'RoleReady is an AI-powered platform transforming how professionals assess job readiness and bridge skill gaps.',
};

export default function AboutUsPage() {
    return (
        <div className="space-y-20 py-8 max-w-5xl mx-auto">
            {/* Hero Section */}
            <section className="text-center space-y-6">
                <h1 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tight leading-tight">
                    Bridging the gap between <span className="text-[#5693C1]">Skills</span> and <span className="text-[#5693C1]">Employment</span>.
                </h1>
                <p className="text-xl text-gray-500 max-w-3xl mx-auto font-medium leading-relaxed">
                    RoleReady is an industry-first career readiness platform that uses AI and real-world mentorship to ensure you're not just qualified—you're ready.
                </p>
            </section>

            {/* Mission Section */}
            <section className="bg-gray-50 rounded-[3rem] p-12 lg:p-20 flex flex-col lg:flex-row gap-12 items-center">
                <div className="flex-1 space-y-6">
                    <div className="inline-flex px-4 py-1.5 bg-blue-100 text-[#5693C1] rounded-full text-xs font-black uppercase tracking-widest">
                        Our Mission
                    </div>
                    <h2 className="text-3xl lg:text-4xl font-black text-gray-900 leading-snug">
                        To provide clarity in the professional journey.
                    </h2>
                    <p className="text-lg text-gray-600 leading-relaxed font-medium">
                        Most professionals know where they want to go, but they don't know exactly what they lack to get there. RoleReady was built to eliminate that ambiguity through objective data and expert validation.
                    </p>
                </div>
                <div className="flex-1 w-full grid grid-cols-2 gap-4">
                    <div className="p-8 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center text-center">
                        <div className="text-4xl font-black text-[#5693C1] mb-2">50k+</div>
                        <div className="text-sm font-bold text-gray-400 uppercase tracking-widest leading-tight">Assessments Completed</div>
                    </div>
                    <div className="p-8 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center text-center">
                        <div className="text-4xl font-black text-[#5693C1] mb-2">120+</div>
                        <div className="text-sm font-bold text-gray-400 uppercase tracking-widest leading-tight">Industry Roles</div>
                    </div>
                </div>
            </section>

            {/* What we do */}
            <section className="space-y-12">
                <div className="text-center max-w-2xl mx-auto space-y-4">
                    <h2 className="text-3xl font-black text-gray-900">How we serve our users</h2>
                    <p className="text-gray-500 font-medium">We've built an ecosystem that goes beyond static resumes.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-4 p-4">
                        <div className="w-12 h-12 bg-[#5693C1] text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-[#5693C1]/20">1</div>
                        <h3 className="text-xl font-bold text-gray-900">AI Assessments</h3>
                        <p className="text-gray-600 leading-relaxed font-medium text-sm">Our algorithms analyze your current skill set against live industry benchmarks for specific job roles.</p>
                    </div>
                    <div className="space-y-4 p-4">
                        <div className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg">2</div>
                        <h3 className="text-xl font-bold text-gray-900">Guided Roadmaps</h3>
                        <p className="text-gray-600 leading-relaxed font-medium text-sm">Receive a step-by-step learning path designed to bridge your specific gaps in the shortest time possible.</p>
                    </div>
                    <div className="space-y-4 p-4">
                        <div className="w-12 h-12 bg-[#5693C1]/20 text-[#5693C1] rounded-2xl flex items-center justify-center font-black text-xl">3</div>
                        <h3 className="text-xl font-bold text-gray-900">Expert Validation</h3>
                        <p className="text-gray-600 leading-relaxed font-medium text-sm">Get your skills validated by real industry mentors, establishing credible proof of your professional readiness.</p>
                    </div>
                </div>
            </section>

            {/* Credibility */}
            <section className="text-center py-12 border-t border-gray-100">
                <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-sm mb-10">Trusted by professionals from</p>
                <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-30 grayscale pointer-events-none select-none">
                    <div className="text-2xl font-black italic tracking-tighter">Google</div>
                    <div className="text-2xl font-black italic tracking-tighter">Microsoft</div>
                    <div className="text-2xl font-black italic tracking-tighter">Amazon</div>
                    <div className="text-2xl font-black italic tracking-tighter">Netflix</div>
                    <div className="text-2xl font-black italic tracking-tighter">Meta</div>
                </div>
            </section>

            {/* CTA */}
            <section className="p-12 bg-gradient-to-br from-[#5693C1] to-[#4a80b0] rounded-[3rem] text-center space-y-8 shadow-2xl shadow-blue-200 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse" />
                <h2 className="text-3xl lg:text-4xl font-black text-white leading-tight">Ready to prove your readiness?</h2>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                    <Link href="/signup" className="px-10 py-4 bg-white text-[#5693C1] font-black rounded-2xl hover:bg-gray-50 transition-all hover:shadow-xl hover:-translate-y-1">
                        Get Started Free
                    </Link>
                    <Link href="/pricing" className="px-10 py-4 bg-white/10 text-white font-black rounded-2xl hover:bg-white/20 transition-all border border-white/20">
                        View Pricing
                    </Link>
                </div>
            </section>
        </div>
    );
}
