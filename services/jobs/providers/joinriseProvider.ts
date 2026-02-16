import { AggregatedJob, JobProvider } from '@/types/jobs';

const JOINRISE_BASE_URL = 'https://api.joinrise.io/api/v1';

export class JoinRiseProvider implements JobProvider {
    name = 'joinrise';

    // Simple in-memory cache specifically for JoinRise job data seen in search
    private static jobCache = new Map<string, AggregatedJob>();

    async fetchJobs(query: string = '', page: number = 1): Promise<AggregatedJob[]> {
        try {
            const combinedQuery = query ? `${query} India` : 'India';
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
                search: combinedQuery
            });

            const response = await fetch(`${JOINRISE_BASE_URL}/jobs/public?${params.toString()}`, {
                next: { revalidate: 3600 }
            });

            if (!response.ok) return [];

            const json = await response.json();
            const rawJobs = json.result?.jobs || json.data || [];

            const processedJobs = rawJobs
                .map((j: any) => this.normalizeJob(j))
                .filter((job: AggregatedJob) =>
                    (job.location?.toLowerCase().includes('india')) ||
                    (job.company?.toLowerCase().includes('india')) ||
                    (job.description?.toLowerCase().includes('india'))
                );

            // Populate the static cache so detail views can find these jobs even if detail API fails
            processedJobs.forEach((job: AggregatedJob) => {
                const rawId = job.id.replace('joinrise-', '');
                JoinRiseProvider.jobCache.set(rawId, job);
            });

            return processedJobs;
        } catch (error) {
            console.error('JoinRise fetch error:', error);
            return [];
        }
    }

    async getJobById(id: string): Promise<AggregatedJob | null> {
        // 1. Check local cache first (highly reliable for jobs just seen in search)
        if (JoinRiseProvider.jobCache.has(id)) {
            return JoinRiseProvider.jobCache.get(id)!;
        }

        try {
            // 2. Try direct API
            const response = await fetch(`${JOINRISE_BASE_URL}/jobs/${id}`);
            if (response.ok) {
                const json = await response.json();
                const jobData = json.result?.job || json.result || json.data;
                if (jobData) return this.normalizeJob(jobData);
            }

            // 3. Fallback: Search for the job in the current India listings if cache missed
            // (e.g. if user refreshed the page or came from a direct link)
            const fallbackJobs = await this.fetchJobs('', 1);
            return fallbackJobs.find(j => j.id === `joinrise-${id}`) || null;
        } catch (error) {
            return null;
        }
    }

    private normalizeJob(job: any): AggregatedJob {
        return {
            id: `joinrise-${job._id || job.id}`,
            title: job.title || 'Untitled Role',
            company: job.owner?.companyName || job.companyName || 'Unknown Company',
            location: job.locationAddress || job.location || 'Remote',
            remote: job.type === 'Remote' || job.descriptionBreakdown?.workModel === 'Remote',
            description: job.descriptionBreakdown?.oneSentenceJobSummary || job.title || '',
            url: job.url || job.applyUrl || '#',
            employmentType: job.descriptionBreakdown?.employmentType || job.type || 'Full-time',
            salary: job.descriptionBreakdown?.salaryRangeMinYearly
                ? `$${job.descriptionBreakdown.salaryRangeMinYearly.toLocaleString()} - $${job.descriptionBreakdown.salaryRangeMaxYearly?.toLocaleString()}`
                : 'Not specified',
            postedAt: job.createdAt || new Date().toISOString(),
            source: "joinrise"
        };
    }
}
