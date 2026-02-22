export type InternshipDTO = {
    id: string;
    title: string;
    company: string;
    location?: string;
    remote?: boolean;
    description?: string;
    url: string;
    duration?: string;
    stipend?: string;
    postedAt?: string;
    source: string;
    priority?: number;
    matchScore?: number;
    skills?: string[];
    applicants?: number;
    deadline?: string;
    companyDescription?: string;
};

export interface InternshipProvider {
    name: string;
    fetchInternships(query?: string, page?: number): Promise<InternshipDTO[]>;
    getInternshipById?(id: string): Promise<InternshipDTO | null>;
}

export type InternshipResponse = {
    recommended?: InternshipDTO[];
    others?: InternshipDTO[];
    data?: InternshipDTO[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
};
