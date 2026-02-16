import { InternshipDTO, InternshipProvider } from '@/types/internships';
import { JoinRiseInternshipProvider } from './providers/joinriseInternshipProvider';
import { ArbeitnowInternshipProvider } from './providers/arbeitnowInternshipProvider';

const cache = new Map<string, { data: InternshipDTO[]; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 15; // 15 minutes

class InternshipAggregatorService {
    private providers: InternshipProvider[];

    constructor() {
        this.providers = [
            new JoinRiseInternshipProvider(),
            new ArbeitnowInternshipProvider(),
        ];
    }

    async fetchAggregatedInternships(query: string = '', page: number = 1): Promise<InternshipDTO[]> {
        const cacheKey = `internships-${query}-${page}`;
        const cached = cache.get(cacheKey);

        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            return cached.data;
        }

        try {
            // 1. Fetch in parallel
            const results = await Promise.allSettled(
                this.providers.map(p => p.fetchInternships(query, page))
            );

            // 2. Merge
            let all: InternshipDTO[] = [];
            results.forEach(res => {
                if (res.status === 'fulfilled') {
                    all = [...all, ...res.value];
                }
            });

            // 3. Deduplicate
            const unique = this.deduplicate(all);
            console.log(`[InternshipAggregator] Unique items after dedupe: ${unique.length}`);

            // 4. Filter (India or Remote)
            let filtered = unique.filter(item => {
                const isIndia = item.location?.toLowerCase().includes('india');
                const isRemote = item.remote === true ||
                    item.location?.toLowerCase().includes('remote') ||
                    item.title.toLowerCase().includes('remote');
                return isIndia || isRemote;
            });

            console.log(`[InternshipAggregator] Items after India/Remote filter: ${filtered.length}`);

            // 5. Fallback: If no India/Remote results, show at least some top global ones
            if (filtered.length === 0 && unique.length > 0) {
                console.log(`[InternshipAggregator] No local/remote found, providing top global fallback`);
                filtered = unique.slice(0, 10); // Show top 10 as "Global Opportunities"
            }

            cache.set(cacheKey, { data: filtered, timestamp: Date.now() });
            return filtered;
        } catch (error) {
            console.error('Internship aggregator error:', error);
            return [];
        }
    }

    async getInternshipById(id: string): Promise<InternshipDTO | null> {
        for (const provider of this.providers) {
            if (id.startsWith(provider.name) && provider.getInternshipById) {
                const rawId = id.replace(`${provider.name}-`, '');
                const item = await provider.getInternshipById(rawId);
                if (item) return item;
            }
        }

        // Fallback search
        for (const provider of this.providers) {
            if (provider.getInternshipById) {
                const rawId = id.includes('-') ? id.split('-')[1] : id;
                const item = await provider.getInternshipById(rawId);
                if (item) return item;
            }
        }

        return null;
    }

    private deduplicate(items: InternshipDTO[]): InternshipDTO[] {
        const seen = new Set<string>();
        const result: InternshipDTO[] = [];

        for (const item of items) {
            const titleKey = `${item.title.toLowerCase().trim()}|${item.company.toLowerCase().trim()}`;
            const urlKey = item.url.split('?')[0].toLowerCase();

            if (!seen.has(titleKey) && !seen.has(urlKey)) {
                seen.add(titleKey);
                seen.add(urlKey);
                result.push(item);
            }
        }

        return result;
    }
}

export const internshipAggregatorService = new InternshipAggregatorService();
