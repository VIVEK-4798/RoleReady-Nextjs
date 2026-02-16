import React from 'react';
import Link from 'next/link';
import { MapPin, Building2, Calendar, ArrowRight, DollarSign } from 'lucide-react';
import { InternshipDTO } from '@/types/internships';

interface InternshipCardProps {
    internship: InternshipDTO;
}

export default function InternshipCard({ internship }: InternshipCardProps) {
    const postedDate = internship.postedAt ? new Date(internship.postedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    }) : 'Just now';

    return (
        <div className="group bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl hover:shadow-[#5693C1]/5 hover:border-[#5693C1]/20 transition-all duration-300 flex flex-col h-full relative overflow-hidden">
            {/* Source Label */}
            <div className="absolute top-0 right-0 p-3">
                <span className="text-[8px] text-gray-400 font-medium uppercase tracking-widest bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                    {internship.source}
                </span>
            </div>

            <div className="mb-4">
                <div className="flex justify-between items-start gap-4">
                    <div className="flex-grow">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#5693C1] transition-colors line-clamp-2">
                            {internship.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-2 text-gray-600 font-medium">
                            <Building2 className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{internship.company}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="flex items-center gap-2 text-gray-500 bg-gray-50/50 px-3 py-2 rounded-lg">
                    <MapPin className="w-4 h-4 text-[#5693C1]" />
                    <span className="text-xs font-medium truncate">
                        {internship.remote ? 'Remote' : (internship.location || 'India')}
                    </span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 bg-gray-50/50 px-3 py-2 rounded-lg">
                    <Calendar className="w-4 h-4 text-[#5693C1]" />
                    <span className="text-xs font-medium">{internship.duration || '3-6 Months'}</span>
                </div>
            </div>

            <div className="flex items-center gap-2 mb-6 text-[#5693C1] bg-[#5693C1]/5 px-4 py-2 rounded-xl border border-[#5693C1]/10">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm font-bold uppercase tracking-wide">
                    {internship.stipend || 'Competitive Stipend'}
                </span>
            </div>

            <p className="text-gray-600 text-sm line-clamp-3 mb-8 leading-relaxed">
                {internship.description}
            </p>

            <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                <span className="text-xs text-gray-400 font-medium">
                    Posted {postedDate}
                </span>

                <Link
                    href={`/internships/${internship.id}`}
                    className="flex items-center gap-2 text-[#5693C1] font-bold text-sm hover:gap-3 transition-all"
                >
                    View Details
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </div>
    );
}
