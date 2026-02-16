import { AggregatedJob, JobProvider } from '@/types/jobs';

const ARBEITNOW_BASE_URL = 'https://www.arbeitnow.com/api/job-board-api';

export class ArbeitnowProvider implements JobProvider {
    name = 'arbeitnow';

    async fetchJobs(query: string = '', page: number = 1): Promise<AggregatedJob[]> {
        try {
            // Arbeitnow doesn't have a direct search param on this endpoint, 
            // but we can fetch and filter, or use pages.
            const response = await fetch(`${ARBEITNOW_BASE_URL}?page=${page}`, {
                next: { revalidate: 3600 }
            });

            if (!response.ok) return [];

            const json = await response.json();
            const rawJobs = json.data || [];

            let jobs = rawJobs.map(this.normalizeJob);

            // Filtering logic: Location India OR Remote
            // + Query matching if present
            return jobs.filter((job: AggregatedJob) => {
                const matchesLocation = job.remote || (job.location?.toLowerCase().includes('india'));
                const matchesQuery = !query ||
                    job.title.toLowerCase().includes(query.toLowerCase()) ||
                    job.company.toLowerCase().includes(query.toLowerCase());

                return matchesLocation && matchesQuery;
            });
        } catch (error) {
            console.error('Arbeitnow fetch error:', error);
            return [];
        }
    }

    async getJobById(id: string): Promise<AggregatedJob | null> {
        try {
            // Arbeitnow doesn't have a direct detail API, so we search the feed
            const response = await fetch(`${ARBEITNOW_BASE_URL}`, {
                next: { revalidate: 3600 }
            });
            if (!response.ok) return null;
            const json = await response.json();
            // The ID passed here is `arbeitnow-${job.slug}`, so we need to extract the slug
            const slug = id.replace('arbeitnow-', '');
            const rawJob = json.data?.find((j: any) => j.slug === slug);
            return rawJob ? this.normalizeJob(rawJob) : null;
        } catch (error) {
            console.error('Arbeitnow getJobById error:', error);
            return null;
        }
    }

    private normalizeJob(job: any): AggregatedJob {
        return {
            id: `arbeitnow-${job.slug}`,
            title: job.title || 'Untitled Role',
            company: job.company_name || 'Unknown Company',
            location: job.location || 'Remote',
            remote: job.remote || false,
            description: job.description || '',
            url: job.url || '#',
            employmentType: 'Full-time', // Arbeitnow usually full-time, can refine if needed
            postedAt: new Date(job.created_at * 1000).toISOString(),
            source: "arbeitnow"
        };
    }
}
