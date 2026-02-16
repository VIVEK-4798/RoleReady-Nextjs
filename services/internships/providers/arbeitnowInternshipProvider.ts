import { InternshipDTO, InternshipProvider } from '@/types/internships';

const ARBEITNOW_BASE_URL = 'https://www.arbeitnow.com/api/job-board-api';

export class ArbeitnowInternshipProvider implements InternshipProvider {
    name = 'arbeitnow';

    async fetchInternships(query: string = '', page: number = 1): Promise<InternshipDTO[]> {
        try {
            const response = await fetch(`${ARBEITNOW_BASE_URL}?page=${page}`, {
                next: { revalidate: 3600 }
            });

            if (!response.ok) return [];

            const json = await response.json();
            const raw = json.data || [];

            console.log(`[ArbeitnowInternships] Found ${raw.length} raw items`);

            return raw
                .map(this.normalize)
                .filter((intern: InternshipDTO) => {
                    const isIntern = intern.title.toLowerCase().includes('intern') ||
                        intern.description?.toLowerCase().includes('intern');

                    const matchesQuery = !query ||
                        intern.title.toLowerCase().includes(query.toLowerCase()) ||
                        intern.company.toLowerCase().includes(query.toLowerCase());

                    // Relaxed check: for internships, we prioritize discovery and show remote-friendly global roles
                    return isIntern && matchesQuery;
                });
        } catch (error) {
            console.error('Arbeitnow Internship Provider error:', error);
            return [];
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
