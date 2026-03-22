import React from 'react';
import Image from 'next/image';

interface MentorProps {
  name: string;
  title?: string;
  company?: string;
  experience?: number;
  profileImage?: string;
  linkedinUrl?: string;
  isVerified?: boolean;
}

export default function MentorCard({ mentor }: { mentor: MentorProps }) {
  if (!mentor) return null;

  return (
    <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center gap-4">
      <div className="flex-shrink-0 relative w-12 h-12 rounded-full overflow-hidden bg-gray-200 border-2 border-white shadow-sm flex items-center justify-center">
        {mentor.profileImage ? (
          <Image src={mentor.profileImage} alt={mentor.name} fill className="object-cover" />
        ) : (
          <span className="text-lg font-bold text-gray-400">{mentor.name.charAt(0)}</span>
        )}
      </div>
      
      <div className="flex-1">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
          Reviewed by Mentor
        </div>
        <div className="flex items-center gap-2">
          <h4 className="font-bold text-gray-900">{mentor.name}</h4>
          {mentor.isVerified && (
            <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm border border-green-200">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Verified Mentor
            </span>
          )}
        </div>
        
        <div className="text-sm border-l-2 border-[#5693C1] pl-2 py-0.5 mt-1 text-gray-600">
          {(mentor.title || mentor.company) ? (
            <p>
              {mentor.title && <span className="font-medium text-gray-800">{mentor.title}</span>}
              {mentor.title && mentor.company && " @ "}
              {mentor.company && <span className="text-[#5693C1] font-semibold">{mentor.company}</span>}
            </p>
          ) : (
            <p className="text-gray-500">Industry Professional</p>
          )}
          {mentor.experience && (
            <p className="text-xs text-gray-500 mt-0.5">{mentor.experience}+ years experience</p>
          )}
        </div>
      </div>

      {mentor.linkedinUrl && (
        <a 
          href={mentor.linkedinUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="shrink-0 flex items-center gap-2 font-semibold text-sm text-[#0a66c2] bg-blue-50 hover:bg-blue-100 transition-colors px-3 py-1.5 rounded-lg border border-blue-200 shadow-sm whitespace-nowrap"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
          </svg>
          View Profile
        </a>
      )}
    </div>
  );
}
