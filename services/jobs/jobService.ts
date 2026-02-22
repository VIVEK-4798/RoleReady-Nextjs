import { Job } from '@/lib/models';
import connectDB from '@/lib/db/mongoose';
import { AggregatedJob } from '@/types/jobs';
import { jobAggregatorService } from './jobAggregatorService';

export const jobService = {
    /**
     * Get jobs from both internal DB and external providers.
     * Internal jobs appear first based on priority.
     */
    async getJobs(query: string = '', page: number = 1, limit: number = 10): Promise<AggregatedJob[]> {
        await connectDB();

        // 1. Fetch internal jobs from MongoDB
        const mongoQuery: any = { isActive: true };
        if (query) {
            mongoQuery.$or = [
                { title: { $regex: query, $options: 'i' } },
                { company: { $regex: query, $options: 'i' } },
                { city: { $regex: query, $options: 'i' } },
            ];
        }

        // We fetch a bit more than needed to ensure we have enough after merging if ranking
        const internalJobsRaw = await Job.find(mongoQuery)
            .sort({ priority: -1, createdAt: -1 })
            .lean();

        const internalJobs: AggregatedJob[] = internalJobsRaw.map((job: any) => ({
            id: job._id.toString(),
            title: job.title,
            company: job.company,
            location: job.city,
            description: job.description || job.workDetail,
            url: `/jobs/${job._id}`,
            salary: job.salary,
            type: job.type,
            postedAt: job.createdAt.toISOString(),
            source: 'internal',
            priority: job.priority ?? 100
        }));

        // 2. Fetch external jobs from aggregator
        // We only fetch external if we are on early pages or if query is provided
        let externalJobs: AggregatedJob[] = [];
        try {
            externalJobs = await jobAggregatorService.fetchAggregatedJobs(query, page);
            // External jobs have hardcoded priority 10
            externalJobs = externalJobs.map(job => ({
                ...job,
                priority: job.priority || 10,
                source: 'external'
            }));
        } catch (error) {
            console.error('External jobs fetch error:', error);
        }

        // 3. Merge and Sort
        const allJobs = [...internalJobs, ...externalJobs];

        // Sort by priority (DESC) then by date (DESC)
        allJobs.sort((a, b) => {
            const priorityDiff = (b.priority || 0) - (a.priority || 0);
            if (priorityDiff !== 0) return priorityDiff;

            const dateA = a.postedAt ? new Date(a.postedAt).getTime() : 0;
            const dateB = b.postedAt ? new Date(b.postedAt).getTime() : 0;
            return dateB - dateA;
        });

        // 4. Manual Pagination
        const skip = (page - 1) * limit;
        return allJobs.slice(skip, skip + limit);
    },

    async getJobById(id: string): Promise<AggregatedJob | null> {
        await connectDB();

        // 1. Try internal DB first if it's a valid ObjectId
        if (id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id)) {
            const internalJob = await Job.findById(id).lean();
            if (internalJob) {
                return {
                    id: internalJob._id.toString(),
                    title: internalJob.title,
                    company: internalJob.company,
                    location: internalJob.city,
                    description: internalJob.description || internalJob.workDetail,
                    url: `/jobs/${internalJob._id}`,
                    salary: internalJob.salary,
                    type: internalJob.type,
                    postedAt: internalJob.createdAt.toISOString(),
                    source: 'internal',
                    priority: internalJob.priority ?? 100
                } as AggregatedJob;
            }
        }

        // 2. Fallback to aggregator for external jobs
        return await jobAggregatorService.getJobById(id);
    }
};
