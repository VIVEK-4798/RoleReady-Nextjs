import Link from 'next/link';
import { JobDTO } from '@/types/jobs';
import { MapPin, Briefcase, Clock, Building2, ArrowRight } from 'lucide-react';

interface JobCardProps {
    job: JobDTO;
}

export default function JobCard({ job }: JobCardProps) {
    return (
        <div className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 group">
            <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-[#5693C1]/5 rounded-lg text-[#5693C1] group-hover:bg-[#5693C1] group-hover:text-white transition-colors">
                        <Building2 className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#5693C1] bg-[#5693C1]/10 px-2 py-1 rounded">
                            {job.employmentType || 'Full-time'}
                        </span>
                        <span className="text-[8px] text-gray-400 font-medium uppercase tracking-widest bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                            {job.source}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-grow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#5693C1] transition-colors line-clamp-1">
                        {job.title}
                    </h3>
                    <p className="text-gray-600 font-medium mb-4 flex items-center gap-1">
                        {job.company}
                    </p>

                    <div className="space-y-2 mb-6">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <MapPin className="w-4 h-4" />
                            <span>{job.location || 'Remote'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Briefcase className="w-4 h-4" />
                            <span>{job.employmentType}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span>{new Date(job.postedAt || '').toLocaleDateString()}</span>
                        </div>
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-2 mb-6 min-h-[40px]">
                        {job.description?.replace(/<[^>]*>?/gm, '') || 'No description provided.'}
                    </p>
                </div>

                {/* Footer */}
                <div className="pt-6 border-t border-gray-50 mt-auto">
                    <Link
                        href={`/jobs/${job.id}`}
                        className="flex items-center justify-center gap-2 w-full py-3 bg-[#5693C1]/5 text-[#5693C1] font-semibold rounded-lg hover:bg-[#5693C1] hover:text-white transition-all duration-300"
                    >
                        View Details
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
