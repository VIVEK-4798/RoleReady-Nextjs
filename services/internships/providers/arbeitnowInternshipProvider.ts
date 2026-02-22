import { InternshipDTO, InternshipProvider } from '@/types/internships';

const ARBEITNOW_BASE_URL = 'https://www.arbeitnow.com/api/job-board-api';

export class ArbeitnowInternshipProvider implements InternshipProvider {
    name = 'arbeitnow';
    private static cache = new Map<string, InternshipDTO>();

    async fetchInternships(query: string = '', page: number = 1): Promise<InternshipDTO[]> {
        try {
            const response = await fetch(`${ARBEITNOW_BASE_URL}?page=${page}`, {
                next: { revalidate: 3600 }
            });

            if (!response.ok) return [];

            const json = await response.json();
            const raw = json.data || [];

            console.log(`[ArbeitnowInternships] Found ${raw.length} raw items`);

            const processed = raw
                .map((item: any) => this.normalize(item))
                .filter((intern: InternshipDTO) => {
                    const isIntern = intern.title.toLowerCase().includes('intern') ||
                        intern.description?.toLowerCase().includes('intern');

                    const matchesQuery = !query ||
                        intern.title.toLowerCase().includes(query.toLowerCase()) ||
                        intern.company.toLowerCase().includes(query.toLowerCase());

                    return isIntern && matchesQuery;
                });

            // Update cache
            processed.forEach((item: InternshipDTO) => {
                ArbeitnowInternshipProvider.cache.set(item.id.replace('arbeitnow-', ''), item);
            });

            return processed;
        } catch (error) {
            console.error('Arbeitnow Internship Provider error:', error);
            return [];
        }
    }

    async getInternshipById(id: string): Promise<InternshipDTO | null> {
        // 1. Check cache first
        if (ArbeitnowInternshipProvider.cache.has(id)) {
            return ArbeitnowInternshipProvider.cache.get(id)!;
        }

        // 2. Fetch raw list and search manually to bypass internship-only filters
        try {
            const response = await fetch(ARBEITNOW_BASE_URL);
            if (!response.ok) return null;

            const json = await response.json();
            const raw = json.data || [];

            const found = raw.find((item: any) => item.slug === id);
            if (found) {
                const normalized = this.normalize(found);
                ArbeitnowInternshipProvider.cache.set(id, normalized);
                return normalized;
            }
            return null;
        } catch (error) {
            console.error('Arbeitnow getInternshipById error:', error);
            return null;
        }
    }

    private normalize(item: any): InternshipDTO {
        return {
            id: `arbeitnow-${item.slug}`,
            title: item.title || 'Untitled Internship',
            company: item.company_name || 'Unknown Company',
            location: item.location || 'Remote',
            remote: item.remote || false,
            description: item.description?.replace(/<[^>]*>?/gm, '') || item.title || '',
            url: item.url || '#',
            duration: '3-6 Months',
            stipend: 'Competitive',
            postedAt: new Date(item.created_at * 1000).toISOString(),
            source: 'arbeitnow'
        };
    }
}
