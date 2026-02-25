import React, { useState } from 'react';
import { SocialIcon, SocialPlatform } from './SocialIcon';
import { SocialManagementModal } from './SocialManagementModal';
import { Settings2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface SocialLinks {
    linkedin?: string;
    github?: string;
    twitter?: string;
}

interface ProfileSocialLinksProps {
    initialLinks: SocialLinks;
    onUpdate: () => void;
}

/**
 * ProfileSocialLinks displays social icons and provides a centralized management button.
 * - Handles redirection via SocialIcon.
 * - Shows toast warnings for missing links.
 * - Opens Management Modal only via the "Edit" button.
 */
export const ProfileSocialLinks = ({ initialLinks, onUpdate }: ProfileSocialLinksProps) => {
    const [showManager, setShowManager] = useState(false);

    /**
     * Updates/Adds a social link via the service API.
     */
    const handleUpdate = async (platform: SocialPlatform, url: string) => {
        try {
            if (!url) {
                // If empty URL provided, treat as deletion
                const resp = await fetch('/api/profile/social-link', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ platform }),
                });
                const data = await resp.json();
                if (!data.success) throw new Error(data.error);
            } else {
                // Standard Update
                const resp = await fetch('/api/profile/social-link', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ platform, url }),
                });
                const data = await resp.json();
                if (!data.success) throw new Error(data.error);
            }

            onUpdate(); // Trigger parent refresh to update icon states
        } catch (e: any) {
            console.error('Update failed:', e);
            throw e;
        }
    };

    const handleMissingLink = (platformName: string) => {
        toast(`Please enter your ${platformName} link first in the Edit menu.`, {
            icon: '🔗',
            style: {
                borderRadius: '12px',
                background: '#fff',
                color: '#333',
                fontWeight: 'bold',
                border: '1px solid #f3f4f6'
            },
        });
    };

    return (
        <div className="flex items-center gap-5 p-1">
            <div className="flex items-center gap-3">
                <SocialIcon
                    platform="linkedin"
                    url={initialLinks.linkedin}
                    onMissing={handleMissingLink}
                />
                <SocialIcon
                    platform="github"
                    url={initialLinks.github}
                    onMissing={handleMissingLink}
                />
                <SocialIcon
                    platform="twitter"
                    url={initialLinks.twitter}
                    onMissing={handleMissingLink}
                />
            </div>

            <div className="h-8 w-px bg-gray-200 mx-1" />

            <button
                onClick={() => setShowManager(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-2xl text-sm font-bold hover:bg-gray-50 hover:border-[#5693C1] hover:text-[#5693C1] transition-all shadow-sm active:scale-95 group"
            >
                <Settings2 size={16} className="text-gray-400 group-hover:rotate-45 transition-all" />
                Manage Profiles
            </button>

            {showManager && (
                <SocialManagementModal
                    initialLinks={initialLinks}
                    onSave={handleUpdate}
                    onClose={() => setShowManager(false)}
                />
            )}
        </div>
    );
};
