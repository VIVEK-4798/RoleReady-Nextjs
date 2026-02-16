import { useState, useEffect, useCallback } from 'react';
import { InternshipDTO } from '@/types/internships';

export function useInternships(query: string = '', page: number = 1) {
    const [internships, setInternships] = useState<InternshipDTO[]>([]);
    const [recommendedInternships, setRecommendedInternships] = useState<InternshipDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        setInternships([]);
        setRecommendedInternships([]);
        setHasMore(true);
    }, [query]);

    const fetchInternships = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/internships?query=${encodeURIComponent(query)}&page=${page}`);
            if (!response.ok) throw new Error('Failed to fetch internships');
            const result = await response.json();

            const newOthers = result.others || result.data || [];
            const newRecommended = result.recommended || [];

            if (page === 1) {
                setRecommendedInternships(newRecommended);
                setInternships(newOthers);

                if (newOthers.length + newRecommended.length < 5) {
                    setHasMore(false);
                }
            } else {
                setInternships(prev => {
                    const newData = [...prev, ...newOthers];
                    const unique = Array.from(new Map(newData.map(item => [item.id, item])).values());
                    return unique;
                });

                if (newOthers.length < 5) {
                    setHasMore(false);
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
            if (page === 1) {
                setInternships([]);
                setRecommendedInternships([]);
            }
        } finally {
            setLoading(false);
        }
    }, [query, page]);

    useEffect(() => {
        fetchInternships();
    }, [fetchInternships]);

    return { internships, recommendedInternships, loading, error, hasMore, refetch: fetchInternships };
}

export function useInternshipDetails(id: string) {
    const [internship, setInternship] = useState<InternshipDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        const fetchDetail = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`/api/internships/${id}`);
                if (!response.ok) throw new Error('Internship not found');
                const data = await response.json();
                setInternship(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Something went wrong');
                setInternship(null);
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [id]);

    return { internship, loading, error };
}
