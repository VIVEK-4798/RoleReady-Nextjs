import { Internship } from '@/lib/models';
import connectDB from '@/lib/db/mongoose';
import { InternshipDTO } from '@/types/internships';
import { internshipAggregatorService } from './internshipAggregatorService';

export const internshipService = {
    /**
     * Get internships from both internal DB and external providers.
     * Internal internships appear first based on priority.
     */
    async getInternships(query: string = '', page: number = 1, limit: number = 10): Promise<InternshipDTO[]> {
        await connectDB();

        // 1. Fetch internal internships from MongoDB
        const mongoQuery: any = { isActive: true };
        if (query) {
            mongoQuery.$or = [
                { title: { $regex: query, $options: 'i' } },
                { company: { $regex: query, $options: 'i' } },
                { city: { $regex: query, $options: 'i' } },
            ];
        }

        const internalRaw = await Internship.find(mongoQuery)
            .sort({ priority: -1, createdAt: -1 })
            .lean();

        const internalInternships: InternshipDTO[] = internalRaw.map((item: any) => ({
            id: item._id.toString(),
            title: item.title,
            company: item.company,
            location: item.city,
            description: item.description || item.workDetail,
            url: `/internships/${item._id}`,
            stipend: item.stipend,
            duration: item.duration,
            postedAt: item.createdAt.toISOString(),
            source: 'internal',
            priority: item.priority ?? 100
        }));

        // 2. Fetch external internships
        let externalInternships: InternshipDTO[] = [];
        try {
            externalInternships = await internshipAggregatorService.fetchAggregatedInternships(query, page);
            // External internships have lower priority
            externalInternships = externalInternships.map(item => ({
                ...item,
                priority: item.priority || 10,
                source: 'external'
            }));
        } catch (error) {
            console.error('External internships fetch error:', error);
        }

        // 3. Merge and Sort
        const allInternships = [...internalInternships, ...externalInternships];

        allInternships.sort((a, b) => {
            const priorityDiff = (b.priority || 0) - (a.priority || 0);
            if (priorityDiff !== 0) return priorityDiff;

            const dateA = a.postedAt ? new Date(a.postedAt).getTime() : 0;
            const dateB = b.postedAt ? new Date(b.postedAt).getTime() : 0;
            return dateB - dateA;
        });

        // 4. Pagination
        const skip = (page - 1) * limit;
        return allInternships.slice(skip, skip + limit);
    },

    async getInternshipById(id: string): Promise<InternshipDTO | null> {
        await connectDB();

        // 1. Try internal DB first
        if (id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id)) {
            const item = await Internship.findById(id).lean();
            if (item) {
                return {
                    id: item._id.toString(),
                    title: item.title,
                    company: item.company,
                    location: item.city,
                    description: item.description || item.workDetail,
                    url: `/internships/${item._id}`,
                    stipend: item.stipend,
                    duration: item.duration,
                    postedAt: item.createdAt.toISOString(),
                    source: 'internal',
                    priority: item.priority ?? 100
                } as InternshipDTO;
            }
        }

        // 2. Fallback to external
        return await internshipAggregatorService.getInternshipById(id);
    }
};
