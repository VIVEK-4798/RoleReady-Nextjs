'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useJobs } from '@/hooks/useJobs';
import JobCard from '@/components/jobs/JobCard';
import JobSkeleton from '@/components/jobs/JobSkeleton';
import { Search, Briefcase, Filter, X, Loader2 } from 'lucide-react';
import { LandingHeader } from '@/components/home';
import PublicFooter from '@/components/layout/PublicFooter';
import { useAuth } from '@/hooks';

export default function JobsClient() {
    const { user, isAuthenticated } = useAuth();
    const [query, setQuery] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const observer = useRef<IntersectionObserver | null>(null);

    const { jobs, recommendedJobs, loading, error, hasMore } = useJobs(searchQuery, page);

    // Intersection Observer for infinite scroll
    const lastJobElementRef = useCallback((node: HTMLDivElement | null) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });

        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearchQuery(query);
        setPage(1);
    };

    const clearSearch = () => {
        setQuery('');
        setSearchQuery('');
        setPage(1);
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <LandingHeader isAuthenticated={isAuthenticated} />

            {/* Hero Header Area */}
            <section className="relative pt-32 pb-20 px-4 md:px-8 bg-white border-b border-gray-100 overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#5693C1]/5 to-transparent pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#5693C1]/5 rounded-full blur-3xl pointer-events-none" />

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="max-w-3xl mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#5693C1]/10 rounded-full text-[#5693C1] font-bold text-sm mb-6">
                            <Briefcase className="w-4 h-4" />
                            Direct Opportunities
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                            Find Opportunities Matching Your <span className="text-[#5693C1]">Goals</span>
                        </h1>

                        <p className="text-lg text-gray-600 mb-10 leading-relaxed">
                            Discover roles and apply through official employer pages. We help you find the right fit and understand your readiness before you take the leap.
                        </p>

                        {/* Search Bar */}
                        <form onSubmit={handleSearch} className="relative group">
                            <div className="flex flex-col md:flex-row gap-3 p-2 bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 group-focus-within:border-[#5693C1]/50 transition-all duration-300">
                                <div className="relative flex-grow">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-[#5693C1] transition-colors" />
                                    <input
                                        type="text"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder="Search by role, company, or keywords..."
                                        className="w-full pl-12 pr-4 py-4 bg-transparent outline-none text-gray-800 placeholder:text-gray-400"
                                    />
                                    {query && (
                                        <button
                                            type="button"
                                            onClick={clearSearch}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    className="px-8 py-4 bg-[#5693C1] text-white font-bold rounded-xl hover:bg-[#4a80b0] transition-all duration-300 shadow-lg shadow-[#5693C1]/20 active:scale-[0.98]"
                                >
                                    Find Jobs
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Quick Stats/Links */}
                    <div className="flex flex-wrap gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span>Real-time job discovery</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-[#5693C1] rounded-full" />
                            <span>Verified employer links</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-orange-500 rounded-full" />
                            <span>Placement readiness insights</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content Area */}
            <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
                {/* Recommended Section (Only if personalized data exists) */}
                {recommendedJobs.length > 0 && !searchQuery && (
                    <div className="mb-20">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 text-orange-600 text-[10px] font-bold uppercase tracking-widest rounded-full mb-3 border border-orange-100/50">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                                    </span>
                                    Personalized Matches
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900 leading-tight">🔥 Recommended for You</h2>
                                <p className="text-gray-500 mt-2 flex items-center gap-2 italic">
                                    "Recommendations based on your target role."
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {recommendedJobs.map((job) => (
                                <JobCard key={job.id} job={job} />
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            {searchQuery ? `Search results for "${searchQuery}"` : (recommendedJobs.length > 0 ? 'All Opportunities' : 'Latest Opportunities')}
                        </h2>
                        <div className="flex flex-col gap-1 mt-1">
                            <p className="text-gray-600">
                                {loading && jobs.length === 0 ? 'Discovering roles...' : `${jobs.length} roles found for you`}
                            </p>
                            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                                Opportunities aggregated from external sources.
                            </p>
                        </div>
                    </div>

                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:border-[#5693C1] hover:text-[#5693C1] transition-all">
                        <Filter className="w-4 h-4" />
                        <span>Filters</span>
                    </button>
                </div>

                {/* Job Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {jobs.map((job, index) => {
                        if (jobs.length === index + 1) {
                            return (
                                <div key={job.id} ref={lastJobElementRef}>
                                    <JobCard job={job} />
                                </div>
                            );
                        } else {
                            return <JobCard key={job.id} job={job} />;
                        }
                    })}

                    {loading && (
                        Array(3).fill(0).map((_, i) => <JobSkeleton key={`skeleton-${i}`} />)
                    )}
                </div>

                {/* Empty State */}
                {!loading && jobs.length === 0 && (
                    <div className="col-span-full py-20 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No jobs found</h3>
                        <p className="text-gray-500 max-w-sm mx-auto">
                            No jobs match your search criteria. Try using different keywords or clearing filters.
                        </p>
                        <button
                            onClick={clearSearch}
                            className="mt-6 font-semibold text-[#5693C1] hover:underline"
                        >
                            Clear all filters
                        </button>
                    </div>
                )}

                {/* Loading Indicator at Bottom */}
                {loading && jobs.length > 0 && (
                    <div className="mt-16 flex justify-center items-center gap-3 text-[#5693C1] font-bold">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span>Loading more opportunities...</span>
                    </div>
                )}

                {/* End of results message */}
                {!hasMore && jobs.length > 0 && (
                    <div className="mt-16 text-center text-gray-400 font-medium">
                        You've reached the end of the available opportunities.
                    </div>
                )}
            </section>

            <PublicFooter />
        </div>
    );
}
