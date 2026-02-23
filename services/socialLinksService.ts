import User from '@/lib/models/User';
import connectDB from '@/lib/db/mongoose';

export type SocialPlatform = 'linkedin' | 'github' | 'twitter' | 'portfolio';

const PLATFORM_REGEX: Record<SocialPlatform, RegExp> = {
    linkedin: /^https:\/\/[a-z.]*linkedin\.com\/in\/[a-zA-Z0-9-_.]+\/?(\?.*)?$/,
    github: /^https:\/\/github\.com\/[a-zA-Z0-9-_.]+\/?(\?.*)?$/,
    twitter: /^https:\/\/(www\.)?(twitter|x)\.com\/[a-zA-Z0-9_]+\/?(\?.*)?$/,
    portfolio: /^https:\/\/[a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=%]+$/,
};

const PLATFORM_DOMAINS: Record<SocialPlatform, string[]> = {
    linkedin: ['linkedin.com'],
    github: ['github.com'],
    twitter: ['twitter.com', 'x.com'],
    portfolio: [],
};

/**
 * SocialLinksService handles business logic for user social media profiles.
 * It enforces strict validation and formatting rules.
 */
export class SocialLinksService {
    /**
     * Validates a social profile URL based on platform-specific strict rules.
     */
    static validateUrl(platform: SocialPlatform, url: string): boolean {
        if (!url || typeof url !== 'string') return false;

        // Must start with https://
        if (!url.startsWith('https://')) return false;

        // Strict regex check for structure and characters
        if (!PLATFORM_REGEX[platform].test(url)) return false;

        // Safety check for domain
        try {
            const parsedUrl = new URL(url);
            const hostname = parsedUrl.hostname.toLowerCase();

            // Check if hostname matches or ends with the allowed domains
            const allowed = PLATFORM_DOMAINS[platform];
            const isDomainValid = allowed.length === 0 || allowed.some(d => hostname === d || hostname.endsWith('.' + d));

            if (!isDomainValid) return false;

        } catch (e) {
            return false;
        }

        return true;
    }

    /**
     * Updates a specific social link for a user.
     */
    static async updateSocialLink(userId: string, platform: SocialPlatform, url: string) {
        await connectDB();

        if (!this.validateUrl(platform, url)) {
            throw new Error(`Invalid ${platform} URL format. Please provide a standard https:// profile link.`);
        }

        const updateField = `profile.socialLinks.${platform}`;
        const updateData: any = {
            $set: { [updateField]: url }
        };

        if (platform === 'linkedin') updateData.$set['profile.linkedinUrl'] = url;
        if (platform === 'github') updateData.$set['profile.githubUrl'] = url;
        if (platform === 'portfolio') updateData.$set['profile.portfolioUrl'] = url;

        const user = await User.findByIdAndUpdate(userId, updateData, { new: true }).lean();

        if (!user) throw new Error('User not found');

        return user.profile?.socialLinks || {};
    }

    /**
     * Removes a specific social link from a user's profile.
     */
    static async removeSocialLink(userId: string, platform: SocialPlatform) {
        await connectDB();

        const unsetField = `profile.socialLinks.${platform}`;
        const updateData: any = {
            $unset: { [unsetField]: "" }
        };

        if (platform === 'linkedin') updateData.$unset['profile.linkedinUrl'] = "";
        if (platform === 'github') updateData.$unset['profile.githubUrl'] = "";
        if (platform === 'portfolio') updateData.$unset['profile.portfolioUrl'] = "";

        const user = await User.findByIdAndUpdate(userId, updateData, { new: true }).lean();

        if (!user) throw new Error('User not found');

        return user.profile?.socialLinks || {};
    }

    /**
     * Retrieves all social links for a user.
     */
    static async getSocialLinks(userId: string) {
        await connectDB();
        const user = await User.findById(userId).select('profile.socialLinks').lean();
        if (!user) throw new Error('User not found');
        return user.profile?.socialLinks || {};
    }
}
