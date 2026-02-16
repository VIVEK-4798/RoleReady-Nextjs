import { useState, useEffect, useCallback } from 'react';
import { JobDTO } from '@/types/jobs';

export function useJobs(query: string = '', page: number = 1) {
    const [jobs, setJobs] = useState<JobDTO[]>([]);
    const [recommendedJobs, setRecommendedJobs] = useState<JobDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);

    // Clear jobs when query changes
    useEffect(() => {
        setJobs([]);
        setRecommendedJobs([]);
        setHasMore(true);
    }, [query]);

    const fetchJobs = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/jobs?query=${encodeURIComponent(query)}&page=${page}`);
            if (!response.ok) throw new Error('Failed to fetch jobs');
            const result = await response.json();

            // Handle categorized response (recommended vs others)
            const newOthers = result.others || result.data || [];
            const newRecommended = result.recommended || [];

            if (page === 1) {
                setRecommendedJobs(newRecommended);
                setJobs(newOthers);

                if (newOthers.length + newRecommended.length < 10) {
                    setHasMore(false);
                }
            } else {
                setJobs(prev => {
                    const newData: JobDTO[] = [...prev, ...newOthers];
                    // Ensure uniqueness by ID
                    const uniqueJobs = Array.from(new Map(newData.map(item => [item.id, item] as [string, JobDTO])).values());
                    return uniqueJobs;
                });

                if (newOthers.length < 10) {
                    setHasMore(false);
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
            if (page === 1) {
                setJobs([]);
                setRecommendedJobs([]);
            }
        } finally {
            setLoading(false);
        }
    }, [query, page]);

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    return { jobs, recommendedJobs, loading, error, hasMore, refetch: fetchJobs };
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
