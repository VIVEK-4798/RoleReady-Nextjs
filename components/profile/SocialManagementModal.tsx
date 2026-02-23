import React, { useState } from 'react';
import { X, Linkedin, Github, Twitter, Globe, Save, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type SocialPlatform = 'linkedin' | 'github' | 'twitter' | 'portfolio';

interface SocialLinks {
    linkedin?: string;
    github?: string;
    twitter?: string;
    portfolio?: string;
}

interface SocialManagementModalProps {
    initialLinks: SocialLinks;
    onSave: (platform: SocialPlatform, url: string) => Promise<void>;
    onClose: () => void;
}

/**
 * SocialManagementModal allows a user to see and update all three social links in one view.
 * It strictly maintains local state and updates it upon successful API saves.
 */
export const SocialManagementModal = ({ initialLinks, onSave, onClose }: SocialManagementModalProps) => {
    const [links, setLinks] = useState<SocialLinks>(initialLinks);
    const [isSaving, setIsSaving] = useState<Record<SocialPlatform, boolean>>({
        linkedin: false,
        github: false,
        twitter: false,
        portfolio: false
    });
    const [errors, setErrors] = useState<Record<SocialPlatform, string>>({
        linkedin: '',
        github: '',
        twitter: '',
        portfolio: ''
    });
    const [successStatus, setSuccessStatus] = useState<Record<SocialPlatform, boolean>>({
        linkedin: false,
        github: false,
        twitter: false,
        portfolio: false
    });

    const platforms: SocialPlatform[] = ['linkedin', 'github', 'twitter', 'portfolio'];
    const platformNames = {
        linkedin: 'LinkedIn',
        github: 'GitHub',
        twitter: 'Twitter / X',
        portfolio: 'Portfolio / Website',
    };
    const platformIcons = {
        linkedin: Linkedin,
        github: Github,
        twitter: Twitter,
        portfolio: Globe,
    };

    const handleUpdate = async (platform: SocialPlatform) => {
        const url = links[platform] || '';

        // Strict URL validation
        if (url && !url.startsWith('https://')) {
            setErrors(prev => ({ ...prev, [platform]: 'URL must start with https://' }));
            return;
        }

        setIsSaving(prev => ({ ...prev, [platform]: true }));
        setErrors(prev => ({ ...prev, [platform]: '' }));
        setSuccessStatus(prev => ({ ...prev, [platform]: false }));

        try {
            await onSave(platform, url.trim());

            // Update local state to ensure persistence while modal is open
            setLinks(prev => ({ ...prev, [platform]: url.trim() }));
            setSuccessStatus(prev => ({ ...prev, [platform]: true }));

            // Clear success icon after 3 seconds
            setTimeout(() => {
                setSuccessStatus(prev => ({ ...prev, [platform]: false }));
            }, 3000);

        } catch (e: any) {
            setErrors(prev => ({ ...prev, [platform]: e.message || 'Failed to update' }));
        } finally {
            setIsSaving(prev => ({ ...prev, [platform]: false }));
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
            >
                <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gradient-to-br from-gray-50/80 to-white shrink-0">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900">Configure Social Profiles</h3>
                        <p className="text-sm text-gray-500 font-medium">Update your professional identity</p>
                    </div>
                    <button onClick={onClose} className="p-3 text-gray-400 hover:text-gray-900 hover:bg-white rounded-2xl transition-all shadow-sm">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-8 space-y-8 overflow-y-auto">
                    {platforms.map((platform) => {
                        const Icon = platformIcons[platform];
                        const isPlatformSaving = isSaving[platform];
                        const hasError = !!errors[platform];
                        const isSuccess = successStatus[platform];

                        return (
                            <div key={platform} className="space-y-3">
                                <div className="flex items-center justify-between px-1">
                                    <div className="flex items-center gap-2">
                                        <div className={`p-1.5 rounded-lg ${platform === 'linkedin' ? 'text-[#0077B5] bg-blue-50' :
                                            platform === 'github' ? 'text-[#333] bg-gray-100' :
                                                platform === 'twitter' ? 'text-black bg-gray-50' :
                                                    'text-emerald-600 bg-emerald-50'
                                            }`}>
                                            <Icon size={18} />
                                        </div>
                                        <label className="text-sm font-bold text-gray-700">
                                            {platformNames[platform]}
                                        </label>
                                    </div>
                                    <AnimatePresence mode="wait">
                                        {isSuccess ? (
                                            <motion.span
                                                key="success"
                                                initial={{ opacity: 0, x: 5 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full"
                                            >
                                                <CheckCircle2 size={12} />
                                                Saved
                                            </motion.span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                                                <ShieldCheck size={12} />
                                                HTTPS Secure
                                            </span>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <div className="relative group">
                                    <input
                                        type="text"
                                        value={links[platform] || ''}
                                        onChange={(e) => {
                                            setLinks(prev => ({ ...prev, [platform]: e.target.value }));
                                            setErrors(prev => ({ ...prev, [platform]: '' }));
                                        }}
                                        placeholder={
                                            platform === 'twitter' ? 'https://x.com/your-username' :
                                                platform === 'portfolio' ? 'https://yourwebsite.com' :
                                                    `https://${platform}.com/your-username`
                                        }
                                        className={`w-full pl-5 pr-24 py-4 bg-gray-50/50 border-2 rounded-2xl outline-none transition-all font-medium text-gray-700 ${hasError ? 'border-red-100 focus:border-red-500 bg-red-50/30' : 'border-transparent focus:border-[#5693C1] focus:bg-white focus:shadow-sm'
                                            }`}
                                    />
                                    <button
                                        onClick={() => handleUpdate(platform)}
                                        disabled={isPlatformSaving}
                                        className={`absolute right-2 top-2 bottom-2 px-5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${isPlatformSaving ? 'bg-gray-100 text-gray-400' : 'bg-[#5693C1] text-white hover:bg-[#4a80b0] shadow-sm'
                                            }`}
                                    >
                                        {isPlatformSaving ? (
                                            <div className="w-4 h-4 border-2 border-gray-300 border-t-[#5693C1] rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <Save size={14} />
                                                Update
                                            </>
                                        )}
                                    </button>
                                </div>

                                {hasError && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                                        className="px-1 text-xs text-red-500 font-bold flex items-center gap-1"
                                    >
                                        <span className="w-1 h-1 bg-red-500 rounded-full" />
                                        {errors[platform]}
                                    </motion.p>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="p-8 bg-gray-50/80 shrink-0 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        Finished Configuration
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
