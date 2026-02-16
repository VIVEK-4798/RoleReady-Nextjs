export type AggregatedJob = {
    id: string;
    title: string;
    company: string;
    location?: string;
    remote?: boolean;
    description?: string;
    url: string;
    employmentType?: string;
    salary?: string;
    postedAt?: string;
    source: string;
    matchScore?: number; // Added for personalization
};

// Keep JobDTO for full backward compatibility with frontend components
export type JobDTO = AggregatedJob;

export interface JobProvider {
    name: string;
    fetchJobs(query?: string, page?: number): Promise<AggregatedJob[]>;
    getJobById?(id: string): Promise<AggregatedJob | null>;
}

export type JobResponse = {
    recommended?: AggregatedJob[]; // Personalized for logged-in users
    others?: AggregatedJob[];      // Remaining jobs
    data?: AggregatedJob[];        // Fallback/Guest flat list
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
};
