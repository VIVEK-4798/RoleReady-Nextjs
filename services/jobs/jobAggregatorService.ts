import { AggregatedJob, JobProvider } from '@/types/jobs';
import { JoinRiseProvider } from './providers/joinriseProvider';
import { ArbeitnowProvider } from './providers/arbeitnowProvider';

// Simple in-memory cache
const cache = new Map<string, { data: AggregatedJob[]; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 15; // 15 minutes

class JobAggregatorService {
    private providers: JobProvider[];

    constructor() {
        this.providers = [
            new JoinRiseProvider(),
            new ArbeitnowProvider()
        ];
    }

    async fetchAggregatedJobs(query: string = '', page: number = 1): Promise<AggregatedJob[]> {
        const cacheKey = `jobs-${query}-${page}`;
        const cached = cache.get(cacheKey);

        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            return cached.data;
        }

        try {
            // 1. Call all providers in parallel
            const results = await Promise.allSettled(
                this.providers.map(p => p.fetchJobs(query, page))
            );

            // 2. Merge arrays and handle failures
            let allJobs: AggregatedJob[] = [];
            results.forEach((res) => {
                if (res.status === 'fulfilled') {
                    allJobs = [...allJobs, ...res.value];
                }
            });

            // 3. Deduplicate
            const uniqueJobs = this.deduplicateJobs(allJobs);

            // 4. Final Filter (Location India OR Remote)
            const filteredJobs = uniqueJobs.filter(job => {
                const isIndia = job.location?.toLowerCase().includes('india');
                const isRemote = job.remote === true || job.location?.toLowerCase().includes('remote');
                return isIndia || isRemote;
            });

            // 5. Cache and return
            cache.set(cacheKey, { data: filteredJobs, timestamp: Date.now() });
            return filteredJobs;
        } catch (error) {
            console.error('Aggregator error:', error);
            return [];
        }
    }

    async getJobById(id: string): Promise<AggregatedJob | null> {
        // Determine provider from ID prefix if possible
        for (const provider of this.providers) {
            if (id.startsWith(provider.name) && provider.getJobById) {
                // Strip prefix for provider internal call
                const providerId = id.replace(`${provider.name}-`, '');
                const job = await provider.getJobById(providerId);
                if (job) return job;
            }
        }

        // Fallback: search across all providers (expensive but safe)
        for (const provider of this.providers) {
            if (provider.getJobById) {
                const providerId = id.includes('-') ? id.split('-')[1] : id;
                const job = await provider.getJobById(providerId);
                if (job) return job;
            }
        }

        return null;
    }

    private deduplicateJobs(jobs: AggregatedJob[]): AggregatedJob[] {
        const seen = new Set<string>();
        const result: AggregatedJob[] = [];

        for (const job of jobs) {
            // Key: Title + Company OR Normalized URL
            const titleKey = `${job.title.toLowerCase().trim()}|${job.company.toLowerCase().trim()}`;
            const urlKey = job.url.split('?')[0].toLowerCase(); // Normalize URL manually

            if (!seen.has(titleKey) && !seen.has(urlKey)) {
                seen.add(titleKey);
                seen.add(urlKey);
                result.push(job);
            }
        }

        return result;
    }
}

export const jobAggregatorService = new JobAggregatorService();
