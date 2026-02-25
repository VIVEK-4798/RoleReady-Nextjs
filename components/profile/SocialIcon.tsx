import React from 'react';
import { Linkedin, Github, Twitter } from 'lucide-react';
import { motion } from 'framer-motion';

export type SocialPlatform = 'linkedin' | 'github' | 'twitter';

interface SocialIconProps {
    platform: SocialPlatform;
    url?: string;
    onMissing: (platform: string) => void;
}

const iconMap = {
    linkedin: Linkedin,
    github: Github,
    twitter: Twitter,
};

const colorMap = {
    linkedin: 'text-[#0077B5] border-blue-50 bg-white',
    github: 'text-[#333] border-gray-100 bg-white',
    twitter: 'text-black border-gray-50 bg-white',
};

/**
 * SocialIcon displays a brand icon for a social platform.
 * - Redirects to the URL if present.
 * - Triggers a "missing" handler if no URL is set.
 */
export const SocialIcon = ({ platform, url, onMissing }: SocialIconProps) => {
    const Icon = iconMap[platform];
    const hasLink = !!url;

    const handleClick = (e: React.MouseEvent) => {
        if (!hasLink) {
            e.preventDefault();
            onMissing(platform.charAt(0).toUpperCase() + platform.slice(1));
        }
    };

    return (
        <motion.a
            href={url || '#'}
            target={hasLink ? "_blank" : "_self"}
            rel="noopener noreferrer"
            onClick={handleClick}
            whileHover={{ scale: 1.08, translateY: -2 }}
            whileTap={{ scale: 0.96 }}
            className={`flex items-center justify-center w-12 h-12 rounded-2xl border-2 transition-all duration-300 shadow-sm outline-none cursor-pointer ${hasLink
                ? `${colorMap[platform]} hover:shadow-md hover:border-[#5693C1]`
                : 'bg-gray-50/80 border-dashed border-gray-200 text-gray-400 opacity-60'
                }`}
            title={hasLink ? `View Profile` : `Click to connect`}
        >
            <Icon size={22} strokeWidth={hasLink ? 2.5 : 2} />
        </motion.a>
    );
};
