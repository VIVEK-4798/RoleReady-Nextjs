export type JobDTO = {
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
    source: "joinrise";
};

export type JobResponse = {
    data: any[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
};
