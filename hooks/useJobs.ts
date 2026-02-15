import { useState, useEffect, useCallback } from 'react';
import { JobDTO } from '@/types/jobs';

export function useJobs(query: string = '', page: number = 1) {
    const [jobs, setJobs] = useState<JobDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchJobs = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/jobs?query=${encodeURIComponent(query)}&page=${page}`);
            if (!response.ok) throw new Error('Failed to fetch jobs');
            const data = await response.json();
            setJobs(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
            setJobs([]);
        } finally {
            setLoading(false);
        }
    }, [query, page]);

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    return { jobs, loading, error, refetch: fetchJobs };
}

export function useJobDetails(id: string) {
    const [job, setJob] = useState<JobDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        const fetchDetail = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`/api/jobs/${id}`);
                if (!response.ok) throw new Error('Job not found');
                const data = await response.json();
                setJob(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Something went wrong');
                setJob(null);
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [id]);

    return { job, loading, error };
}
