import { JobDTO } from '@/types/jobs';

const JOINRISE_BASE_URL = 'https://api.joinrise.io/api/v1';

// Light in-memory cache for individual job details
const jobCache = new Map<string, { data: JobDTO; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 15; // 15 minutes

/**
 * Normalize JoinRise job data into platform JobDTO
 */
function normalizeJob(job: any): JobDTO {
    return {
        id: job._id || job.id,
        title: job.title || 'Untitled Role',
        company: job.company?.name || job.companyName || 'Unknown Company',
        location: job.location || job.jobLoc || 'Remote',
        remote: job.isRemote || job.workType === 'remote',
        description: job.description || job.jobDescription || '',
        url: job.applyUrl || job.url || '#',
        employmentType: job.employmentType || job.jobType || 'Full-time',
        salary: job.salaryRange || job.salary || 'Not specified',
        postedAt: job.createdAt || job.postedAt || new Date().toISOString(),
        source: "joinrise"
    };
}

/**
 * Search jobs via JoinRise API
 */
export async function searchJobs(query: string = '', page: number = 1): Promise<JobDTO[]> {
    try {
        const params = new URLSearchParams({
            search: query,
            page: page.toString(),
            limit: '12',
            sort: 'desc',
            sortedBy: 'createdAt'
        });

        const response = await fetch(`${JOINRISE_BASE_URL}/jobs/public?${params.toString()}`, {
            next: { revalidate: 3600 } // ISR for 1 hour
        });

        if (!response.ok) {
            console.error('JoinRise API error:', response.statusText);
            return [];
        }

        const json = await response.json();
        const jobs = json.data || [];

        return jobs.map(normalizeJob);
    } catch (error) {
        console.error('Failed to fetch jobs from JoinRise:', error);
        return [];
    }
}

/**
 * Get job details by ID
 */
export async function getJobById(id: string): Promise<JobDTO | null> {
    // Check cache first
    const cached = jobCache.get(id);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }

    try {
        // JoinRise public detail endpoint often follows /jobs/public/:id or /jobs/:id
        // If specific detail endpoint is unknown, we can fallback to searching/filtering
        const response = await fetch(`${JOINRISE_BASE_URL}/jobs/public/${id}`);

        if (!response.ok) {
            // Fallback: search for it if detail endpoint fails
            // (Some public APIs only provide list, so we search and find)
            const list = await searchJobs('', 1);
            const found = list.find(j => j.id === id);
            if (found) {
                jobCache.set(id, { data: found, timestamp: Date.now() });
                return found;
            }
            return null;
        }

        const json = await response.json();
        const normalized = normalizeJob(json.data || json);

        // Cache the result
        jobCache.set(id, { data: normalized, timestamp: Date.now() });

        return normalized;
    } catch (error) {
        console.error(`Failed to fetch job ${id}:`, error);
        return null;
    }
}
