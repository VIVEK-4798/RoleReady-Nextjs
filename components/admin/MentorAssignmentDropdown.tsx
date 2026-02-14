import React, { useState, useEffect } from 'react';

interface MentorWorkload {
    mentorId: string;
    mentorName: string;
    assignedUsersCount: number;
    pendingValidationsCount: number;
    isActive: boolean;
}

interface MentorAssignmentDropdownProps {
    userId: string;
    currentMentorId?: string | null;
    onAssign?: (newMentorId: string | null) => void;
    className?: string;
    showWorkload?: boolean;
}

export default function MentorAssignmentDropdown({
    userId,
    currentMentorId,
    onAssign,
    className = '',
    showWorkload = true
}: MentorAssignmentDropdownProps) {
    const [mentors, setMentors] = useState<MentorWorkload[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedMentor, setSelectedMentor] = useState<string>(currentMentorId || '');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Correct initialize state if prop changes
        setSelectedMentor(currentMentorId || '');
    }, [currentMentorId]);

    useEffect(() => {
        // Fetch mentor workload data
        const fetchMentors = async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/admin/mentor-workload');
                const data = await res.json();

                if (data.success) {
                    // Filter active mentors only
                    setMentors(data.mentors.filter((m: MentorWorkload) => m.isActive));
                } else {
                    setError('Failed to load mentors');
                }
            } catch (err) {
                console.error('Error fetching mentors:', err);
                setError('Error loading data');
            } finally {
                setLoading(false);
            }
        };

        fetchMentors();
    }, []);

    const handleAssign = async (mentorId: string) => {
        setLoading(true);
        setError(null);

        // Determine the correct endpoint and payload
        const isChange = !!currentMentorId;
        const endpoint = isChange ? '/api/admin/change-mentor' : '/api/admin/assign-mentor';

        const payload = isChange
            ? { userId, newMentorId: mentorId || null }
            : { userId, mentorId };

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (data.success) {
                setSelectedMentor(mentorId);
                if (onAssign) onAssign(mentorId || null);
            } else {
                setError(data.error || 'Assignment failed');
            }
        } catch (err) {
            console.error('Error assigning mentor:', err);
            setError('Connection failed');
        } finally {
            setLoading(false);
        }
    };

    if (error) {
        return (
            <div className="text-red-500 text-sm flex items-center gap-2">
                <span>⚠</span> {error}
                <button
                    onClick={() => setError(null)}
                    className="text-xs underline text-red-600 hover:text-red-800"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className={`relative ${className}`}>
            <select
                value={selectedMentor}
                onChange={(e) => handleAssign(e.target.value)}
                disabled={loading}
                className={`
          block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#5693C1] focus:border-[#5693C1] sm:text-sm rounded-md 
          ${loading ? 'opacity-50 cursor-wait' : ''}
          bg-white shadow-sm border text-black
        `}
            >
                <option value="">
                    {currentMentorId ? 'Unassign (No Mentor)' : 'Select a Mentor'}
                </option>

                {mentors.map((mentor) => (
                    <option key={mentor.mentorId} value={mentor.mentorId}>
                        {mentor.mentorName}
                        {showWorkload && ` (${mentor.assignedUsersCount} users, ${mentor.pendingValidationsCount} pending)`}
                    </option>
                ))}
            </select>

            {loading && (
                <div className="absolute right-8 top-1/2 -translate-y-1/2">
                    <div className="animate-spin h-4 w-4 border-2 border-[#5693C1] rounded-full border-t-transparent"></div>
                </div>
            )}
        </div>
    );
}
