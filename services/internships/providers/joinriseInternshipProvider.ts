import { InternshipDTO, InternshipProvider } from '@/types/internships';

const JOINRISE_BASE_URL = 'https://api.joinrise.io/api/v1';

export class JoinRiseInternshipProvider implements InternshipProvider {
    name = 'joinrise';

    // Cache discovered internships to handle potential detail API failures
    private static cache = new Map<string, InternshipDTO>();

    async fetchInternships(query: string = '', page: number = 1): Promise<InternshipDTO[]> {
        const tryFetch = async (searchQuery: string) => {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
                search: searchQuery
            });

            const response = await fetch(`${JOINRISE_BASE_URL}/jobs/public?${params.toString()}`, {
                next: { revalidate: 3600 }
            });

            if (!response.ok) return [];
            const json = await response.json();
            return json.result?.jobs || [];
        };

        try {
            // 1. Try specific search (India)
            const combinedQuery = query ? `${query} Internship India` : 'Internship India';
            let raw = await tryFetch(combinedQuery);

            // 2. Fallback to broader if specific failed
            if (raw.length === 0) {
                console.log(`[JoinRiseInternships] FAILED India search, trying broader 'Internship'`);
                const broaderQuery = query ? `${query} Internship` : 'Internship';
                raw = await tryFetch(broaderQuery);
            }

            console.log(`[JoinRiseInternships] Found ${raw.length} raw items`);

            const processed = raw.map(this.normalize).filter((intern: InternshipDTO) =>
                intern.title.toLowerCase().includes('intern') ||
                intern.description?.toLowerCase().includes('intern')
            );

            console.log(`[JoinRiseInternships] After 'intern' keyword filter: ${processed.length}`);

            // Store in cache for detail views
            processed.forEach((intern: InternshipDTO) => {
                JoinRiseInternshipProvider.cache.set(intern.id.replace('joinrise-', ''), intern);
            });

            return processed;
        } catch (error) {
            console.error('JoinRise Internship Provider error:', error);
            return [];
        }
    }

    async getInternshipById(id: string): Promise<InternshipDTO | null> {
        if (JoinRiseInternshipProvider.cache.has(id)) {
            return JoinRiseInternshipProvider.cache.get(id)!;
        }

        try {
            const response = await fetch(`${JOINRISE_BASE_URL}/jobs/${id}`);
            if (!response.ok) return null;

            const json = await response.json();
            const data = json.result?.job || json.result;
            if (!data) return null;

            return this.normalize(data);
        } catch (error) {
            return null;
        }
    }

    private normalize(item: any): InternshipDTO {
        return {
            id: `joinrise-${item._id || item.id}`,
            title: item.title || 'Untitled Internship',
            company: item.owner?.companyName || item.companyName || 'Unknown Company',
            location: item.locationAddress || item.location || 'Remote',
            remote: item.type === 'Remote' ||
                item.descriptionBreakdown?.workModel === 'Remote' ||
                item.title.toLowerCase().includes('remote') ||
                (item.locationAddress?.toLowerCase().includes('remote')),
            description: item.descriptionBreakdown?.oneSentenceJobSummary || item.title || '',
            url: item.url || item.applyUrl || '#',
            duration: '3-6 Months', // JoinRise doesn't always specify, default for internships
            stipend: item.descriptionBreakdown?.salaryRangeMinYearly
                ? `$${(item.descriptionBreakdown.salaryRangeMinYearly / 12).toFixed(0)}/mo`
                : 'Unpaid/Stipend',
            postedAt: item.createdAt || new Date().toISOString(),
            source: 'joinrise'
        };
    }
}
