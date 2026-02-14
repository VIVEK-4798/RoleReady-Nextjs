'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Github,
    RefreshCw,
    Check,
    ChevronRight,
    Search,
    Star,
    GitFork,
    Calendar,
    AlertCircle,
    Code,
    ArrowRight,
    Sparkles,
    Plus
} from 'lucide-react';
import { IGitHubRepo } from '@/types';
import { toast } from 'react-hot-toast';

export default function ImportGithubClient() {
    const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
    const [isLoading, setIsLoading] = useState(false);
    const [repos, setRepos] = useState<IGitHubRepo[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestedSkills, setSuggestedSkills] = useState<any[]>([]);
    const [isImporting, setIsImporting] = useState(false);
    const [tokenMissing, setTokenMissing] = useState(false);

    // Fetch repositories
    const fetchRepos = async () => {
        setIsLoading(true);
        setTokenMissing(false);
        try {
            const response = await fetch('/api/github/repos');
            const result = await response.json();

            if (result.success) {
                setRepos(result.data);
                if (step === 1) setStep(2);
            } else {
                if (result.error?.includes('access token not found')) {
                    setTokenMissing(true);
                }
                toast.error(result.error || 'Failed to fetch repositories');
            }
        } catch (error) {
            toast.error('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReconnect = async () => {
        setIsLoading(true);
        try {
            // Re-trigger GitHub OAuth sign in
            const { signIn: nextAuthSignIn } = await import('next-auth/react');
            await nextAuthSignIn('github', { callbackUrl: window.location.href });
        } catch (error) {
            toast.error('Failed to initiate reconnection');
            setIsLoading(false);
        }
    };

    // Handle Import
    const handleImport = async () => {
        if (selectedIds.length === 0) return;

        setIsImporting(true);
        try {
            const response = await fetch('/api/github/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ repoIds: selectedIds }),
            });

            const result = await response.json();

            if (result.success) {
                toast.success(`Successfully imported ${selectedIds.length} projects!`);
                fetchSuggestedSkills();
                setStep(4);
            } else {
                toast.error(result.error || 'Import failed');
            }
        } catch (error) {
            toast.error('Failed to connect to server');
        } finally {
            setIsImporting(false);
        }
    };

    // Fetch suggested skills
    const fetchSuggestedSkills = async () => {
        try {
            const response = await fetch(`/api/github/suggested-skills?repoIds=${selectedIds.join(',')}`);
            const result = await response.json();
            if (result.success) {
                setSuggestedSkills(result.data);
            }
        } catch (error) {
            console.error('Failed to fetch skill suggestions');
        }
    };

    const filteredRepos = repos.filter(repo =>
        repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (repo.description?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const toggleSelection = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[#5693C1] font-bold text-sm uppercase tracking-wider">
                        <Github className="w-4 h-4" />
                        <span>GitHub Integration</span>
                    </div>
                    <h1 className="text-3xl font-black text-gray-900">Import Projects</h1>
                    <p className="text-gray-500 font-medium font-outfit">
                        Turn your real-world code into career assets by importing your repositories.
                    </p>
                </div>

                {step === 2 && (
                    <button
                        onClick={fetchRepos}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-600 hover:text-[#5693C1] transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh Repositories
                    </button>
                )}
            </div>

            {/* Progress Steps */}
            <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                {[
                    { id: 1, label: 'Connect' },
                    { id: 2, label: 'Select' },
                    { id: 4, label: 'Boost' }
                ].map((s, idx) => (
                    <div key={s.id} className="flex items-center gap-4 flex-1 last:flex-none">
                        <div className={`flex items-center gap-2 font-bold ${step >= s.id ? 'text-[#5693C1]' : 'text-gray-300'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= s.id ? 'border-[#5693C1] bg-[#5693C1]/5' : 'border-gray-200'}`}>
                                {step > s.id ? <Check className="w-4 h-4" /> : s.id === 4 ? 3 : s.id}
                            </div>
                            <span className="hidden sm:inline">{s.label}</span>
                        </div>
                        {idx < 2 && <div className={`flex-1 h-px ${step > s.id ? 'bg-[#5693C1]' : 'bg-gray-100'}`} />}
                    </div>
                ))}
            </div>

            {/* Step Components */}
            <div className="min-h-[400px]">
                {step === 1 && (
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden p-12 text-center space-y-8 animate-in fade-in zoom-in duration-500">
                        <div className="w-24 h-24 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto ring-8 ring-gray-50/50">
                            <Github className="w-12 h-12 text-gray-900" />
                        </div>
                        <div className="max-w-md mx-auto space-y-4">
                            <h2 className="text-2xl font-black text-gray-900 leading-tight">Sync Your Repositories</h2>
                            <p className="text-gray-500 font-medium">
                                We'll fetch your personal repositories and let you pick which ones represent your best work.
                            </p>
                        </div>
                        <div className="flex flex-col items-center gap-4">
                            <button
                                onClick={fetchRepos}
                                disabled={isLoading}
                                className="inline-flex items-center gap-3 px-8 py-4 bg-gray-900 text-white font-black rounded-2xl hover:scale-105 transition-all shadow-xl hover:shadow-gray-900/20 active:scale-95 disabled:bg-gray-400"
                            >
                                {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Github className="w-5 h-5" />}
                                <span>{isLoading ? 'Fetching Data...' : 'Load My Repositories'}</span>
                                <ChevronRight className="w-5 h-5" />
                            </button>

                            {tokenMissing && (
                                <button
                                    onClick={handleReconnect}
                                    className="text-[#5693C1] font-bold text-sm hover:underline flex items-center gap-2 animate-in fade-in slide-in-from-top-2"
                                >
                                    <AlertCircle className="w-4 h-4" />
                                    <span>Account sync required. Click here to reconnect GitHub.</span>
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Filter Bar */}
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search repositories..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 shadow-sm focus:ring-2 focus:ring-[#5693C1] focus:border-transparent transition-all outline-none text-gray-900 font-medium"
                            />
                        </div>

                        {/* List */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredRepos.map((repo) => (
                                <div
                                    key={repo.id}
                                    onClick={() => toggleSelection(repo.id)}
                                    className={`group relative p-6 rounded-[2rem] border transition-all cursor-pointer ${selectedIds.includes(repo.id)
                                        ? 'bg-[#5693C1]/5 border-[#5693C1] shadow-lg shadow-[#5693C1]/10'
                                        : 'bg-white border-gray-100 hover:border-[#5693C1]/50 shadow-sm'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`p-3 rounded-2xl ${selectedIds.includes(repo.id) ? 'bg-[#5693C1] text-white' : 'bg-gray-50 text-gray-400'} group-hover:scale-110 transition-transform`}>
                                            <Code className="w-5 h-5" />
                                        </div>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedIds.includes(repo.id) ? 'bg-[#5693C1] border-[#5693C1]' : 'border-gray-200'
                                            }`}>
                                            {selectedIds.includes(repo.id) && <Check className="w-4 h-4 text-white" />}
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-black text-gray-900 mb-2 truncate">{repo.name}</h3>
                                    <p className="text-gray-500 text-sm font-medium line-clamp-2 h-10 mb-6">
                                        {repo.description || 'No description provided.'}
                                    </p>

                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {repo.primaryLanguage && (
                                            <span className="px-2.5 py-1 bg-blue-50 text-[#5693C1] text-[10px] font-black uppercase tracking-wider rounded-lg">
                                                {repo.primaryLanguage}
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1 text-gray-400 text-xs font-bold">
                                            <Star className="w-3 h-3" /> {repo.stars}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                        <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1 uppercase tracking-tight">
                                            <Calendar className="w-3 h-3" /> Updated {new Date(repo.updatedAt).toLocaleDateString()}
                                        </span>
                                        {repo.isFork && (
                                            <span className="flex items-center gap-1 text-orange-500 text-[10px] font-black uppercase">
                                                <GitFork className="w-3 h-3" /> Fork
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Sticky Action Footer */}
                        <div className="sticky bottom-8 left-0 right-0 bg-white/80 backdrop-blur-xl border border-gray-100 p-4 rounded-3xl shadow-2xl flex items-center justify-between z-10 animate-in slide-in-from-bottom-10">
                            <div className="px-4">
                                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Selection</span>
                                <p className="text-lg font-black text-gray-900">{selectedIds.length} Projects Selected</p>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    disabled={selectedIds.length === 0 || isImporting}
                                    onClick={handleImport}
                                    className="flex items-center gap-2 px-8 py-4 bg-[#5693C1] text-white font-black rounded-2xl hover:bg-[#4a80b0] hover:scale-105 transition-all disabled:bg-gray-200 disabled:text-gray-400 disabled:scale-100"
                                >
                                    {isImporting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                                    <span>{isImporting ? 'Importing...' : 'Import Selected'}</span>
                                </button>
                            </div>
                        </div>

                        {filteredRepos.length === 0 && !isLoading && (
                            <div className="text-center py-20 bg-white rounded-[2.5rem] border border-gray-100">
                                <div className="w-20 h-20 bg-gray-50 flex items-center justify-center rounded-3xl mx-auto mb-6">
                                    <AlertCircle className="w-10 h-10 text-gray-300" />
                                </div>
                                <h3 className="text-xl font-black text-gray-900 mb-2">No Repositories Found</h3>
                                <p className="text-gray-500 font-medium">Try a different search term or refresh your list.</p>
                            </div>
                        )}
                    </div>
                )}

                {step === 4 && (
                    <div className="space-y-8 animate-in fade-in zoom-in duration-500">
                        {/* Success Hero */}
                        <div className="bg-white rounded-[2.5rem] p-12 text-center border border-gray-100 shadow-xl overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
                            <div className="w-20 h-20 bg-green-50 text-green-600 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-bounce transition-all">
                                <Check className="w-10 h-10" />
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 mb-4">Import Successful!</h2>
                            <p className="text-gray-500 font-medium max-w-md mx-auto mb-8">
                                Your projects are now live on your profile. We've also analyzed your code to suggest skills for your roadmap.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href="/dashboard/profile"
                                    className="px-8 py-4 bg-gray-900 text-white font-black rounded-2xl hover:scale-105 transition-all shadow-lg active:scale-95"
                                >
                                    View My Profile
                                </Link>
                                <button
                                    onClick={() => setStep(2)}
                                    className="px-8 py-4 bg-white text-gray-900 border border-gray-100 font-black rounded-2xl hover:bg-gray-50 transition-all active:scale-95"
                                >
                                    Import More
                                </button>
                            </div>
                        </div>

                        {/* Skill Suggestions Section */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900">Recommended Skills</h3>
                                    <p className="text-gray-500 font-medium">Add these to your skill list based on your imports.</p>
                                </div>
                                <div className="p-3 bg-[#5693C1]/10 text-[#5693C1] rounded-2xl">
                                    <Sparkles className="w-6 h-6" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {suggestedSkills.length > 0 ? suggestedSkills.map((skill) => (
                                    <div
                                        key={skill.id}
                                        className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group flex items-center justify-between"
                                    >
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-black text-[#5693C1] uppercase tracking-widest">{skill.domain}</span>
                                            <h4 className="text-lg font-black text-gray-900">{skill.name}</h4>
                                        </div>
                                        <button
                                            className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 group-hover:bg-[#5693C1] group-hover:text-white flex items-center justify-center transition-all"
                                            title="Add Skill"
                                        >
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    </div>
                                )) : Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="h-24 bg-gray-50 animate-pulse rounded-3xl" />
                                ))}
                            </div>

                            {suggestedSkills.length === 0 && (
                                <div className="p-8 bg-blue-50/50 rounded-3xl border border-dashed border-blue-200 text-center">
                                    <p className="text-blue-600 font-medium italic">Scanning for related skills in our database...</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
