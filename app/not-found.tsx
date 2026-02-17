import Link from 'next/link';
import { auth } from '@/lib/auth';
import { FileQuestion, ArrowLeft, Home, Briefcase } from 'lucide-react';

export default async function NotFound() {
    const session = await auth();
    const primaryHref = session ? '/dashboard' : '/';
    const primaryLabel = session ? 'Go to Dashboard' : 'Return Home';

    return (
        <main className="min-h-[100dvh] w-full flex items-center justify-center bg-white px-6 py-24 sm:py-32 lg:px-8 relative overflow-hidden">
            {/* Background Accent - Large 404 Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
                <span className="text-[20rem] md:text-[30rem] font-bold text-gray-50 opacity-[0.4] leading-none">
                    404
                </span>
            </div>

            <div className="text-center relative z-10 max-w-2xl mx-auto">
                {/* Icon Circle */}
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-50 mb-8 animate-in zoom-in duration-500">
                    <FileQuestion className="w-10 h-10 text-[#5693C1]" />
                </div>

                {/* Content */}
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-4">
                    Page Not Found
                </h1>
                <p className="text-lg leading-7 text-gray-600 mb-2">
                    The page you're looking for doesn’t exist or may have been moved.
                </p>
                <p className="text-sm text-gray-400 mb-10">
                    Double-check the URL or return to a safe page.
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        href={primaryHref}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-[#5693C1] px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-[#4a80b0] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5693C1]"
                    >
                        <Home className="w-4 h-4" />
                        {primaryLabel}
                    </Link>

                    <Link
                        href="/"
                        className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg px-8 py-3.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Home className="w-4 h-4" />
                        Home
                    </Link>
                </div>

                {/* Footer Help Hint */}
                <div className="mt-16 pt-8 border-t border-gray-100">
                    <p className="text-sm text-gray-500">
                        Need help? <Link href="/contact" className="text-[#5693C1] font-medium hover:underline">Contact Support</Link>
                    </p>
                </div>
            </div>
        </main>
    );
}
